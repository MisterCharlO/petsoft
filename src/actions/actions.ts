"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authSchema, petFormSchema, petIdSchema } from "@/lib/validations";
import { signIn, signOut } from "@/lib/auth-no-edge";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { checkAuth, getPetById } from "@/lib/server-utils";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// --- user actions ---

export async function logIn(prevState: unknown, formData: unknown) {
	// check if formData is a FormData type
	if (!(formData instanceof FormData)) {
		return {
			message: "Invalid form data.",
		};
	}

	try {
		await signIn("credentials", formData);
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin": {
					return {
						message: "Invalid credentials.",
					};
				}
				default: {
					return {
						message: "Login failed. Could not sign in.",
					};
				}
			}
		}
		throw error; // nextjs redirects throws error, so we need to rethrow it
	}
}

export async function signUp(prevState: unknown, formData: unknown) {
	// check if formData is a FormData type
	if (!(formData instanceof FormData)) {
		return {
			message: "Invalid form data.",
		};
	}

	// convert FormData to object
	const formDataEntries = Object.fromEntries(formData.entries());

	// validate form data
	const validatedFormData = authSchema.safeParse(formDataEntries);
	if (!validatedFormData.success) {
		return {
			message: "Invalid form data.",
		};
	}

	const { email, password } = validatedFormData.data;
	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		await prisma.user.create({
			data: {
				email: email,
				hashedPassword: hashedPassword,
			},
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				return {
					message: "Email already exists.",
				};
			}
		}
		return {
			message: "Could not create user.",
		};
	}

	await signIn("credentials", formData);
}

export async function logOut() {
	await signOut({ redirectTo: "/" });
}

// --- pet actions ---

export async function addPet(petData: unknown) {
	// authentification check
	const session = await checkAuth();

	// validation
	const validatedPet = petFormSchema.safeParse(petData);
	if (!validatedPet.success) {
		return {
			message: "Invalid pet data.",
		};
	}

	try {
		await prisma.pet.create({
			data: {
				...validatedPet.data,
				user: {
					connect: {
						id: session.user.id,
					},
				},
			},
		});
	} catch (error) {
		return {
			message: "Could not add pet.",
		};
	}

	revalidatePath("/app", "layout");
}

export async function editPet(id: unknown, newPetData: unknown) {
	// authentification check
	const session = await checkAuth();

	// validation
	const validatedPetId = petIdSchema.safeParse(id);
	const validatedPet = petFormSchema.safeParse(newPetData);
	if (!validatedPetId.success || !validatedPet.success) {
		return {
			message: "Invalid pet data.",
		};
	}

	// authorization check (user owns the pet)
	const pet = await getPetById(validatedPetId.data);
	if (!pet) {
		return {
			message: "Pet not found.",
		};
	}
	if (pet.userId !== session.user.id) {
		return {
			message: "Not authorized.",
		};
	}

	try {
		await prisma.pet.update({
			where: {
				id: validatedPetId.data,
			},
			data: validatedPet.data,
		});
	} catch (error) {
		return {
			message: "Could not edit pet.",
		};
	}

	revalidatePath("/app", "layout");
}

export async function checkoutPet(id: unknown) {
	// authentification check
	const session = await checkAuth();

	// validation
	const validatedPetId = petIdSchema.safeParse(id);
	if (!validatedPetId.success) {
		return {
			message: "Invalid pet data.",
		};
	}

	// authorization check (user owns the pet)
	const pet = await getPetById(validatedPetId.data);
	if (!pet) {
		return {
			message: "Pet not found.",
		};
	}
	if (pet.userId !== session.user.id) {
		return {
			message: "Not authorized.",
		};
	}

	try {
		await prisma.pet.delete({
			where: {
				id: validatedPetId.data,
			},
		});
	} catch (error) {
		return {
			message: "Could not checkout pet.",
		};
	}

	revalidatePath("/app", "layout");
}

// --- payment actions ---

export async function createCheckoutSession() {
	// authentification check
	const session = await checkAuth();

	// create stripe checkout session
	const checkoutSession = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [
			{
				price: "price_1QuOKUJqolfM4O8W1LTXI5xv",
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${process.env.CANONICAL_URL}/payment?success=true`,
		cancel_url: `${process.env.CANONICAL_URL}/payment?canceled=true`,
		customer_email: session.user.email,
	});

	// redirect user
	redirect(checkoutSession.url);
}
