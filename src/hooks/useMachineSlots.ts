import { useCallback, useEffect, useState } from "react";
import { fetchMachineSlots } from "@/lib/api/client";
import type { MachineSlotsResponse } from "@/types/kiosk";

const REFRESH_MS = Number.parseInt(import.meta.env.VITE_REFRESH_MS ?? "30000", 10);

export function useMachineSlots(machineUuid: string | null) {
  const [data, setData] = useState<MachineSlotsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      if (!machineUuid) {
        setData(null);
        setLoading(false);
        return;
      }

      setError(null);
      const result = await fetchMachineSlots(machineUuid);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดสต็อกตู้ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [machineUuid]);

  useEffect(() => {
    if (!machineUuid) {
      setData(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  return { data, loading, error, reload: load };
}
