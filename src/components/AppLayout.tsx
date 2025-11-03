"use client";

import React from "react";

type AppLayoutProps = {
	children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
	return (
		<div className="min-h-dvh bg-gradient-to-b from-emerald-50 via-amber-50 to-white text-slate-900">
			<header className="w-full border-b border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
				<div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-center">
					<h1 className="text-2xl font-semibold flex items-center gap-2">
						<span role="img" aria-label="leaf">🌿</span>
						<span>PollenSense</span>
					</h1>
				</div>
			</header>

			<main className="mx-auto max-w-2xl px-4 py-8">
				{children}
			</main>

			<footer className="w-full mt-8 border-t border-black/5 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40">
				<div className="mx-auto max-w-2xl px-4 py-3 text-center text-sm text-slate-600">
					MVP v0.1 – Bluetooth pollen tracker prototype
				</div>
			</footer>
		</div>
	);
}


