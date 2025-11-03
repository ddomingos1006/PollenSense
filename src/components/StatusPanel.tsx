"use client";

import React from "react";

type StatusPanelProps = {
	connected: boolean;
	deviceName?: string | null;
	batteryPercent?: number | null;
};

export default function StatusPanel({ connected, deviceName, batteryPercent }: StatusPanelProps) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Connection</span>
				<span
					className={
						"inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs " +
						(connected
							? "bg-emerald-100 text-emerald-800"
							: "bg-slate-100 text-slate-700")
					}
				>
					<span className={"h-2 w-2 rounded-full " + (connected ? "bg-emerald-500" : "bg-slate-400")} />
					{connected ? "Connected" : "Disconnected"}
				</span>
			</div>
			<div className="mt-3 grid grid-cols-2 gap-3 text-sm">
				<div className="space-y-1">
					<div className="text-slate-500">Device</div>
					<div className="font-medium">{deviceName ?? "—"}</div>
				</div>
				<div className="space-y-1">
					<div className="text-slate-500">Battery</div>
					<div className="font-medium">{batteryPercent != null ? `${batteryPercent}%` : "—"}</div>
				</div>
			</div>
		</div>
	);
}


