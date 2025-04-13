import { useRef } from "react";
import { ReactNode } from "react";

interface SpotlightCardProps {
	children: ReactNode;
}

export function SpotlightCard({ children }: SpotlightCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const card = cardRef.current;
		if (!card) return;

		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		card.style.setProperty("--x", `${x}px`);
		card.style.setProperty("--y", `${y}px`);
	};

	return (
		<div
			ref={cardRef}
			onMouseMove={handleMouseMove}
			className="relative group rounded-lg bg-background transition-shadow duration-300 hover:shadow-xl overflow-hidden">
			{/* Glow layer */}
			<div
				className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				style={{
					background:
						"radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.1), transparent 100%)",
				}}
			/>
			{/* Actual card content */}
			<div className="relative z-10 h-full">{children}</div>
		</div>
	);
}
