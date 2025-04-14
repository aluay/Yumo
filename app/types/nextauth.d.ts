import "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: number | string;
			name: string;
			image?: string | null;
			email?: string | null;
		};
	}
}
