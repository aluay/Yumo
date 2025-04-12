import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

// const function that takes an env variable and check if it is defined and not empty
const checkEnv = (envVar: string): string => {
	const value = process.env[envVar];
	if (!value || value.trim() === "") {
		throw new Error(`Environment variable ${envVar} is not defined or empty`);
	}
	return value;
};

const authOptions: AuthOptions = {
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
					userId: user.id,
				},
			});
			if (!existingUser) {
				await prisma.user.create({
					data: {
						useId: user.id,
						email: user.email!,
						name: user.name!,
					},
				});
			}
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
