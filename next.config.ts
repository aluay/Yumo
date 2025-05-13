import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				hostname: "lh3.googleusercontent.com",
			},
			{
				hostname: "i.pravatar.cc",
			},
			{
				hostname: "localhost",
			},
			{
				hostname: "192.168.1.237",
			},
		],
	},
};

export default nextConfig;
