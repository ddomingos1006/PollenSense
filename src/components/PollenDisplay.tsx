"use client";

import { motion } from "framer-motion";
import React from "react";

export type RiskCategory = "low" | "moderate" | "high";

export function getRiskCategory(pollenLevel: number | null): RiskCategory | null {
	if (pollenLevel === null) return null;
	if (pollenLevel <= 30) return "low";
	if (pollenLevel <= 60) return "moderate";
	return "high";
}

function getRecommendation(category: RiskCategory | null): string {
	if (category === "low") return "Safe to go outside.";
	if (category === "moderate") return "Mild risk — sensitive individuals beware.";
	if (category === "high") return "High pollen count! Stay indoors.";
	return "";
}

function categoryStyles(category: RiskCategory | null): string {
	switch (category) {
		case "low":
			return "from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200";
		case "moderate":
			return "from-amber-100 to-amber-50 text-amber-800 border-amber-200";
		case "high":
			return "from-rose-100 to-rose-50 text-rose-800 border-rose-200";
		default:
			return "from-slate-100 to-slate-50 text-slate-800 border-slate-200";
	}
}

type PollenDisplayProps = {
	pollenLevel: number | null;
};

export default function PollenDisplay({ pollenLevel }: PollenDisplayProps) {
	const category = getRiskCategory(pollenLevel);
	const recommendation = getRecommendation(category);

	return (
		<motion.div
			layout
			className={
				"rounded-xl border bg-gradient-to-b p-5 shadow-sm transition-colors " +
				categoryStyles(category)
			}
		>
			<div className="flex items-baseline justify-between">
				<h2 className="text-lg font-medium">Current Pollen Level</h2>
				<span className="text-xs opacity-70">0–100</span>
			</div>
			<div className="mt-4 flex items-end gap-3">
				<motion.div
					key={String(pollenLevel)}
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: "spring", stiffness: 200, damping: 18 }}
					className="text-5xl font-semibold tabular-nums"
				>
					{pollenLevel ?? "—"}
				</motion.div>
				<span className="mb-1 text-sm uppercase tracking-widest opacity-70">
					{category ?? "unknown"}
				</span>
			</div>
			{recommendation && (
				<p className="mt-3 text-sm">
					{recommendation}
				</p>
			)}
		</motion.div>
	);
}


