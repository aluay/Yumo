import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import SignInButton from "../auth/SignInButton";

export default function JoinCommunityCard() {
	return (
		<Card className="border h-full">
			<CardHeader className="pt-3 pb-3 mb-4 border-b">
				<CardTitle className="font-normal flex items-center text-base text-muted-foreground flex items-center gap-2">
					<Users className="w-4 h-4 text-sky-500" />
					Join Our Community
				</CardTitle>
			</CardHeader>

			<CardContent>
				<div className="flex flex-col items-center justify-center py-6 gap-5 text-center">
					<div className="space-y-3">
						<p className="text-sm font-medium leading-relaxed">
							Yumo is a creative space for developers, engineers, and curious
							minds to share insights, teach what they know, and explore ideas
							from others.
						</p>
						<p className="text-xs text-muted-foreground mt-2">
							Sign in to follow creators, teach, learn, and save the content
							that inspires you
						</p>
					</div>
					<div className="w-full">
						<SignInButton className="w-full pulse-animation shadow-sm" />
						<p className="text-xs text-muted-foreground mt-3 italic">
							Join our growing community of tech enthusiasts
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
