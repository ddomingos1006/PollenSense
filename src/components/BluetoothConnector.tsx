"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type BluetoothConnectorProps = {
	onLevel: (level: number | null) => void;
	onConnectionChange?: (connected: boolean, deviceName?: string | null) => void;
	serviceUuid?: BluetoothServiceUUID;
	characteristicUuid?: BluetoothCharacteristicUUID;
	simulation?: boolean;
};

const DEFAULT_SERVICE: BluetoothServiceUUID = "pollen_service" as unknown as BluetoothServiceUUID;
const DEFAULT_CHARACTERISTIC: BluetoothCharacteristicUUID = "pollen_level" as unknown as BluetoothCharacteristicUUID;

export default function BluetoothConnector({
	onLevel,
	onConnectionChange,
	serviceUuid = DEFAULT_SERVICE,
	characteristicUuid = DEFAULT_CHARACTERISTIC,
	simulation = false,
}: BluetoothConnectorProps) {
	const [isConnected, setIsConnected] = useState(false);
	const [deviceName, setDeviceName] = useState<string | null>(null);
	const [isBusy, setIsBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	// Simulation timer
	useEffect(() => {
		if (!simulation) return;
		let level = 12;
		const id = setInterval(() => {
			level = (level + 7) % 101;
			onLevel(level);
		}, 1200);
		setIsConnected(true);
		setDeviceName("Simulated Pollen Wristband");
		onConnectionChange?.(true, "Simulated Pollen Wristband");
		return () => {
			clearInterval(id);
			setIsConnected(false);
			onConnectionChange?.(false, null);
			onLevel(null);
		};
	}, [simulation, onLevel, onConnectionChange]);

	const supported = useMemo(() => typeof navigator !== "undefined" && !!navigator.bluetooth, []);

	const disconnect = useCallback(() => {
		try {
			abortRef.current?.abort();
			onLevel(null);
		} catch {}
		setIsConnected(false);
		onConnectionChange?.(false, null);
	}, [onLevel, onConnectionChange]);

	const connect = useCallback(async () => {
		if (!supported || simulation) return;
		setError(null);
		setIsBusy(true);
		const controller = new AbortController();
		abortRef.current = controller;
		try {
			const device = await navigator.bluetooth.requestDevice({
				filters: [{ namePrefix: "Pollen" }],
				optionalServices: [serviceUuid],
			});

			setDeviceName(device.name ?? "Pollen Sensor");

			const server = await device.gatt!.connect();
			const service = await server.getPrimaryService(serviceUuid);
			const characteristic = await service.getCharacteristic(characteristicUuid);

			const handleValue = (event: Event) => {
				const value = (event as any).target?.value as DataView | undefined;
				if (!value) return;
				const level = value.getUint8(0);
				onLevel(Math.max(0, Math.min(100, level)));
			};

			await characteristic.startNotifications();
			characteristic.addEventListener("characteristicvaluechanged", handleValue);

			setIsConnected(true);
			onConnectionChange?.(true, device.name ?? null);

			device.addEventListener("gattserverdisconnected", () => {
				characteristic.removeEventListener("characteristicvaluechanged", handleValue);
				setIsConnected(false);
				onConnectionChange?.(false, null);
				onLevel(null);
			});
		} catch (e: any) {
			setError(e?.message ?? "Failed to connect to device");
			setIsConnected(false);
			onConnectionChange?.(false, null);
			onLevel(null);
		} finally {
			setIsBusy(false);
		}
	}, [supported, simulation, serviceUuid, characteristicUuid, onLevel, onConnectionChange]);

	if (simulation) {
		return (
			<div className="flex items-center gap-3">
				<button
					type="button"
					className="rounded-md bg-slate-900 px-4 py-2 text-white shadow hover:bg-slate-800 disabled:opacity-60"
					disabled
				>
					Simulating…
				</button>
				<span className="text-sm text-slate-600">{deviceName}</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={isConnected ? disconnect : connect}
					className="rounded-md bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-500 disabled:opacity-60"
					disabled={!supported || isBusy}
				>
					{isConnected ? "Disconnect" : isBusy ? "Connecting…" : "Connect to Sensor"}
				</button>
				<span className="text-sm text-slate-600">{deviceName ?? "—"}</span>
			</div>
			{!supported && (
				<p className="text-xs text-rose-600">
					Web Bluetooth is not supported in this browser or context. Use Chrome Desktop or Android over HTTPS.
				</p>
			)}
			{error && <p className="text-xs text-rose-600">{error}</p>}
		</div>
	);
}


