"use client";

import { useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import BluetoothConnector from "@/components/BluetoothConnector";
import PollenDisplay from "@/components/PollenDisplay";
import StatusPanel from "@/components/StatusPanel";

export default function Home() {
  const [pollenLevel, setPollenLevel] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [simulation, setSimulation] = useState(false);

  const canToggleSimulation = useMemo(
    () => typeof window !== "undefined",
    []
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Connection</h2>
            {canToggleSimulation && (
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="accent-emerald-600"
                  checked={simulation}
                  onChange={(e) => setSimulation(e.target.checked)}
                />
                Simulation mode
              </label>
            )}
          </div>

          <div className="mt-4">
            <BluetoothConnector
              onLevel={setPollenLevel}
              onConnectionChange={(isOn, name) => {
                setConnected(isOn);
                setDeviceName(name ?? null);
              }}
              simulation={simulation}
            />
          </div>

          <div className="mt-6 grid gap-4">
            <StatusPanel connected={connected} deviceName={deviceName} batteryPercent={null} />
            <PollenDisplay pollenLevel={pollenLevel} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
