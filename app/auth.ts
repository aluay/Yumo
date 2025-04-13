import { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

//  Helper function that takes an env var and check if it is defined and not empty
const checkEnv = (envVar: string): string => {
	const value = process.env[envVar];
	if (!value || value.trim() === "") {
		throw new Error(`Environment variable ${envVar} is not defined or empty`);
	}
	return value;
};

export const authOptions: AuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: checkEnv("GOOGLE_CLIENT_ID")!,
			clientSecret: checkEnv("GOOGLE_CLIENT_SECRET")!,
		}),
	],

	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60, // 24 hours
	},

	jwt: {
		secret: checkEnv("NEXTAUTH_SECRET")!,
	},

	secret: checkEnv("NEXTAUTH_SECRET")!,

	callbacks: {
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
	},

	events: {
		async signIn({ user }) {
			const existingUser = await prisma.user.findUnique({
				where: {
					id: Number(user.id),
				},
			});
			if (!existingUser) {
				await prisma.user.create({
					data: {
						id: Number(user.id),
						email: user.email!,
						name: user.name!,
					},
				});
			}
		},
	},
};

export const auth = () => getServerSession(authOptions);
