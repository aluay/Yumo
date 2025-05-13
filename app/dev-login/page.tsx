"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DevLoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async () => {
		await signIn("credentials", {
			username,
			password,
			callbackUrl: "/",
		});
	};

	if (process.env.NODE_ENV === "production") return null;

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Developer Login</CardTitle>
					<CardDescription>
						Enter your developer credentials below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label htmlFor="email">Username</Label>
							<Input
								id="username"
								type="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</div>
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password">Password</Label>
							</div>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button type="submit" className="w-full" onClick={handleLogin}>
							Login
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
