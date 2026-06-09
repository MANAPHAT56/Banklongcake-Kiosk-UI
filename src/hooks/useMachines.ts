import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMachines } from "@/lib/api/client";
import type { Machine } from "@/types/api";

export type MachineFilters = {
  search?: string;
  province?: string;
  availability?: "AVAILABLE" | "UNAVAILABLE" | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const POLL_INTERVAL_MS = 30_000;

export function useMachines(filters: MachineFilters = {}) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // แปลง availability → status + connectionStatus ก่อนส่ง API
      // AVAILABLE  → ส่ง status=ACTIVE + connectionStatus=ONLINE ให้ DB กรอง
      // UNAVAILABLE → ไม่ส่ง filter (ดึงทั้งหมด) แล้วกรอง client-side เพราะ API ไม่มี NOT condition
      const apiFilters = {
        search: filters.search,
        province: filters.province,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.availability === "AVAILABLE" && {
          status: "ACTIVE",
          connectionStatus: "ONLINE",
        }),
      };

      const result = await fetchMachines(apiFilters);
      let data: Machine[] = result.machines ?? result.data ?? [];

      // กรอง UNAVAILABLE ฝั่ง client (= ไม่ใช่ ACTIVE + ONLINE พร้อมกัน)
      if (filters.availability === "UNAVAILABLE") {
        data = data.filter(
          (m) => m.connection_status !== "ONLINE" || m.service_status !== "ACTIVE",
        );
      }

      setMachines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดข้อมูลตู้ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.province,
    filters.availability,
    filters.sortBy,
    filters.sortOrder,
  ]);

  // โหลดครั้งแรก + ตั้ง polling ทุก 30 วิ
  useEffect(() => {
    load();

    intervalRef.current = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [load]);

  return { machines, loading, error, reload: load };
}