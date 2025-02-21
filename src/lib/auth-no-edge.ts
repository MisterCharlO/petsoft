import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import { authSchema, TAuth } from "@/lib/validations";
import { nextAuthEdgeConfig } from "./auth-edge";

const config = {
	...nextAuthEdgeConfig,
	providers: [
		Credentials({
			async authorize(credentials) {
				// validate the object
				const validatedFormData = authSchema.safeParse(credentials);
				if (!validatedFormData.success) {
					return null;
				}

				// extract values from the validated object
				const { email, password } = validatedFormData.data;

				const user = await getUserByEmail(email);
				if (!user) {
					return null;
				}

				const passwordsMatch = bcrypt.compare(password, user.hashedPassword);
				if (!passwordsMatch) {
					console.log("Invalid credentials");
					return null;
				}

				return user;
			},
		}),
	],
} satisfies NextAuthConfig;

export const {
	auth,
	signIn,
	signOut,
	handlers: { GET, POST },
} = NextAuth(config);
