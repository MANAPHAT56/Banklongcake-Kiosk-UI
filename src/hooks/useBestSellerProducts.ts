import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchBestSellerProducts } from "@/lib/api/client";
import { productsToCakes } from "@/lib/products";

const REFRESH_MS = Number.parseInt(import.meta.env.VITE_REFRESH_MS ?? "30000", 10);

export function useBestSellerProducts(limit = 4) {
  const [list, setList] = useState<Awaited<ReturnType<typeof fetchBestSellerProducts>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchBestSellerProducts(limit);
      setList(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดสินค้าแนะนำไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    setLoading(true);
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const cakes = useMemo(() => (list ? productsToCakes(list.data) : []), [list]);

  return { cakes, meta: list?.meta ?? null, loading, error, reload: load };
}
