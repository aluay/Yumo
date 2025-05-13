import { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";

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
		...(process.env.ENABLE_DEV_LOGIN === "true"
			? [
					CredentialsProvider({
						name: "Dev Login",
						credentials: {
							username: { label: "Username", type: "text" },
							password: { label: "Password", type: "password" },
						},
						async authorize(credentials) {
							if (!credentials) return null;

							const email = `${credentials.username}@dev.local`;

							let user = await prisma.user.findUnique({
								where: { email },
							});

							if (credentials.password !== process.env.DEV_LOGIN_PASSWORD) {
								return null;
							}

							if (!user) {
								user = await prisma.user.create({
									data: {
										email,
										name: credentials.username,
										image: `https://i.pravatar.cc/150?u=${credentials.username}`,
									},
								});
							}

							// Ensure there's a linked account record
							await prisma.account.upsert({
								where: {
									provider_providerAccountId: {
										provider: "credentials",
										providerAccountId: email,
									},
								},
								update: {},
								create: {
									userId: user.id,
									type: "credentials",
									provider: "credentials",
									providerAccountId: email,
								},
							});

							return {
								id: user.id.toString(),
								name: user.name,
								email: user.email,
								image: user.image,
							};
						},
					}),
			  ]
			: []),
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
