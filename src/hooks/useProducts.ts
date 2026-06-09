import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProducts } from "@/lib/api/client";
import { productsToCakes } from "@/lib/products";

const REFRESH_MS = Number.parseInt(import.meta.env.VITE_REFRESH_MS ?? "30000", 10);
const DEFAULT_PAGE_LIMIT = 10;

type UseProductsOptions = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export function useProducts(options: UseProductsOptions | string = {}) {
  const search = typeof options === "string" ? options : (options.search ?? "");
  const page = typeof options === "string" ? 1 : (options.page ?? 1);
  const limit = typeof options === "string" ? 100 : (options.limit ?? DEFAULT_PAGE_LIMIT);
  const sortBy = typeof options === "string" ? undefined : options.sortBy;
  const sortOrder = typeof options === "string" ? undefined : options.sortOrder;
  const [list, setList] = useState<Awaited<ReturnType<typeof fetchProducts>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchProducts({
        page,
        limit,
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setList(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [limit, page, search, sortBy, sortOrder]);

  useEffect(() => {
    setLoading(true);
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const cakes = useMemo(() => (list ? productsToCakes(list.data) : []), [list]);

  return { cakes, meta: list?.meta ?? null, loading, error, reload: load };
}
