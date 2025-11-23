"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import BluetoothConnector from "@/components/BluetoothConnector";
import PollenDisplay from "@/components/PollenDisplay";
import StatusPanel from "@/components/StatusPanel";
import { isAuthenticated, logout } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [pollenLevel, setPollenLevel] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [batteryPercent, setBatteryPercent] = useState<number | null>(null);
  const [simulation, setSimulation] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const canToggleSimulation = useMemo(
    () => typeof window !== "undefined",
    []
  );

  useEffect(() => {
    // Check authentication and redirect if needed
    if (typeof window !== "undefined") {
      if (!isAuthenticated()) {
        router.push("/login");
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [router]);

  // Simulate battery level when in simulation mode
  useEffect(() => {
    if (!simulation) {
      setBatteryPercent(null);
      return;
    }

    // Initialize with a random battery level between 60-100%
    setBatteryPercent(Math.floor(Math.random() * 40) + 60);

    // Update battery level periodically (slowly decrease)
    const batteryInterval = setInterval(() => {
      setBatteryPercent((prev) => {
        if (prev === null) return Math.floor(Math.random() * 40) + 60;
        // Slowly decrease battery, but keep it above 50% for demo purposes
        const newBattery = Math.max(50, prev - Math.random() * 0.5);
        return Math.floor(newBattery);
      });
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(batteryInterval);
    };
  }, [simulation]);

  // Don't render content until auth check is complete
  if (isCheckingAuth) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSaveData = () => {
    // Use current battery or generate mock battery if not available
    const currentBattery = batteryPercent ?? Math.floor(Math.random() * 40) + 60; // Mock between 60-100%
    
    // Generate mock AQI metrics
    const mockAQI = {
      pm25: Math.floor(Math.random() * 50) + 10, // PM2.5: 10-60 μg/m³
      pm10: Math.floor(Math.random() * 70) + 20, // PM10: 20-90 μg/m³
      o3: Math.floor(Math.random() * 100) + 50, // Ozone: 50-150 ppb
      no2: Math.floor(Math.random() * 40) + 10, // Nitrogen Dioxide: 10-50 ppb
      co: (Math.random() * 2 + 0.5).toFixed(1), // Carbon Monoxide: 0.5-2.5 ppm
      so2: Math.floor(Math.random() * 30) + 5, // Sulfur Dioxide: 5-35 ppb
    };

    // Create data object
    const data = {
      timestamp: new Date().toISOString(),
      device: {
        name: deviceName || "Unknown Device",
        batteryPercent: currentBattery,
        connected: connected,
      },
      pollen: {
        level: pollenLevel ?? null,
        unit: "grains/m³",
      },
      aqi: {
        overall: Math.floor(Math.random() * 50) + 50, // Overall AQI: 50-100
        pm25: {
          value: mockAQI.pm25,
          unit: "μg/m³",
          category: mockAQI.pm25 < 35 ? "Good" : mockAQI.pm25 < 55 ? "Moderate" : "Unhealthy",
        },
        pm10: {
          value: mockAQI.pm10,
          unit: "μg/m³",
          category: mockAQI.pm10 < 54 ? "Good" : mockAQI.pm10 < 154 ? "Moderate" : "Unhealthy",
        },
        o3: {
          value: mockAQI.o3,
          unit: "ppb",
          category: mockAQI.o3 < 70 ? "Good" : mockAQI.o3 < 85 ? "Moderate" : "Unhealthy",
        },
        no2: {
          value: mockAQI.no2,
          unit: "ppb",
          category: mockAQI.no2 < 53 ? "Good" : mockAQI.no2 < 100 ? "Moderate" : "Unhealthy",
        },
        co: {
          value: parseFloat(mockAQI.co),
          unit: "ppm",
          category: parseFloat(mockAQI.co) < 4.4 ? "Good" : parseFloat(mockAQI.co) < 9.4 ? "Moderate" : "Unhealthy",
        },
        so2: {
          value: mockAQI.so2,
          unit: "ppb",
          category: mockAQI.so2 < 35 ? "Good" : mockAQI.so2 < 75 ? "Moderate" : "Unhealthy",
        },
      },
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pollensense-data-${new Date().toISOString().split("T")[0]}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      headerAction={
        <button
          onClick={handleLogout}
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
        >
          Logout
        </button>
      }
    >
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
            <StatusPanel connected={connected} deviceName={deviceName} batteryPercent={batteryPercent} />
            <PollenDisplay pollenLevel={pollenLevel} />
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleSaveData}
              className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Save Data as File
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
