import type { MachineSlotsResponse, MachinesListResponse, ProductsListResponse } from "@/types/api";
import { normalizeApiProduct } from "@/lib/products";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function resolveHttpBase() {
  if (API_BASE) {
    return API_BASE.replace(/\/$/, "");
  }
  return typeof window !== "undefined" ? window.location.origin : "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${resolveHttpBase()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    const message = payload.error?.message ?? payload.message ?? `คำขอล้มเหลว (${response.status})`;
    const error = new Error(message) as Error & { code?: string; status?: number };
    error.code = payload.error?.code;
    error.status = response.status;
    throw error;
  }

  return payload.data as T;
}

export function fetchProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 100;
  const search = params?.search?.trim();
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) query.set("search", search);
  if (params?.sort_by) query.set("sort_by", params.sort_by);
  if (params?.sort_order) query.set("sort_order", params.sort_order);

  return request<ProductsListResponse>(`/api/products?${query.toString()}`);
}

export function fetchBestSellerProducts(limit = 4) {
  const query = new URLSearchParams({
    limit: String(limit),
  });

  return request<ProductsListResponse>(`/api/products/best-sellers?${query.toString()}`);
}

export async function fetchProductById(id: number) {
  const response = await fetch(`${resolveHttpBase()}/api/products/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error?.message ?? payload.message ?? `ไม่พบสินค้า (${response.status})`;
    throw new Error(message);
  }

  const raw = payload.success === true ? payload.data : payload;
  if (!raw?.id) {
    throw new Error("ไม่พบสินค้า");
  }

  return normalizeApiProduct(raw as Record<string, unknown>);
}

export function fetchMachines(params?: {
  search?: string;
  province?: string;
  status?: string;
  connectionStatus?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 100));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.province?.trim()) query.set("province", params.province.trim());
  if (params?.status) query.set("status", params.status);
  if (params?.connectionStatus) query.set("connectionStatus", params.connectionStatus);
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

  return request<MachinesListResponse>(`/api/customer/machines?${query.toString()}`);
}

export function fetchMachineSlots(machineUuid: string) {
  return request<MachineSlotsResponse>(
    `/api/customer/machines/${encodeURIComponent(machineUuid)}/slots`,
  );
}
