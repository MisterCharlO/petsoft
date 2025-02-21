import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import { authSchema, TAuth } from "@/lib/validations";
import { get } from "http";

export const nextAuthEdgeConfig = {
	pages: {
		signIn: "/login",
	},
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
	callbacks: {
		authorized: ({ auth, request }) => {
			// runs on every request with middleware
			const isLoggedIn = Boolean(auth?.user);
			const isTryingToAccessApp = request.nextUrl.pathname.includes("/app");

			if (!isLoggedIn && isTryingToAccessApp) {
				return false;
			}

			if (isLoggedIn && isTryingToAccessApp && !auth?.user.hasAccess) {
				return Response.redirect(new URL("/payment", request.nextUrl));
			}

			if (isLoggedIn && isTryingToAccessApp && auth?.user.hasAccess) {
				return true;
			}

			if (isLoggedIn && (request.nextUrl.pathname.includes("/login") || request.nextUrl.pathname.includes("/signup")) && auth?.user.hasAccess) {
				return Response.redirect(new URL("/app/dashboard", request.nextUrl));
			}

			if (isLoggedIn && !isTryingToAccessApp && !auth?.user.hasAccess) {
				if (request.nextUrl.pathname.includes("/login") || request.nextUrl.pathname.includes("/signup")) {
					return Response.redirect(new URL("/payment", request.nextUrl));
				}

				return true;
			}

			if (!isLoggedIn && !isTryingToAccessApp) {
				return true;
			}

			return false;
		},
		jwt: async ({ token, user, trigger }) => {
			if (user) {
				// on sign in
				token.userId = user.id!;
				token.email = user.email!;
				token.hasAccess = user.hasAccess;
			}

			if (trigger === "update") {
				// on every request
				const userFromDb = await getUserByEmail(token.email);
				if (userFromDb) {
					token.hasAccess = userFromDb.hasAccess;
				}
			}

			return token;
		},
		session: ({ session, token }) => {
			if (session.user) {
				session.user.id = token.userId;
				session.user.hasAccess = token.hasAccess;
			}

			return session;
		},
	},
} satisfies NextAuthConfig;

export const {
	auth,
	signIn,
	signOut,
	handlers: { GET, POST },
} = NextAuth(nextAuthEdgeConfig);
