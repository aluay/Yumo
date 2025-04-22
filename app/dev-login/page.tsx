"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function DevLoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async () => {
		await signIn("credentials", {
			username,
			password,
			callbackUrl: "/dashboard",
		});
	};

	if (process.env.NODE_ENV === "production") return null;

	return (
		<div className="max-w-sm mx-auto mt-10 space-y-4">
			<h1 className="text-xl font-semibold">Dev Login</h1>
			<input
				className="w-full border rounded p-2"
				placeholder="Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<input
				className="w-full border rounded p-2"
				placeholder="Password"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button
				className="bg-black text-white px-4 py-2 rounded"
				onClick={handleLogin}>
				Login
			</button>
		</div>
	);
}
