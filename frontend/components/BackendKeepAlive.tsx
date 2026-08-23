"use client";

import { useEffect } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const PING_INTERVAL_MS = 10 * 60 * 1000; // every 10 minutes

/**
 * Pings the backend /docs endpoint periodically to prevent Render free tier
 * from spinning down the service (which causes "Failed to fetch" errors).
 */
export function BackendKeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${BACKEND_URL}/docs`, { method: "GET", mode: "no-cors" }).catch(() => {
        // Silent — we just want to keep the server awake
      });
    };

    // Ping immediately on mount
    ping();

    // Then ping every 10 minutes
    const interval = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null; // No UI
}
