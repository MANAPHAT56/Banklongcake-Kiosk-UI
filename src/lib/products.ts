import type { ApiProduct } from "@/types/api";
import type { Cake } from "@/types/cake";

function firstSentence(text: string) {
  const part = text.split(/[.。!?\n]/)[0]?.trim();
  return part && part.length > 0 ? part.slice(0, 100) : "";
}

export function normalizeApiProduct(raw: Record<string, unknown>): ApiProduct {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    price: Number(raw.price),
    image_url: (raw.image_url ?? raw.imageUrl ?? null) as string | null,
    description: (raw.description ?? null) as string | null,
    sales_count: Number(raw.sales_count ?? raw.salesCount ?? 0),
    total_revenue: Number(raw.total_revenue ?? raw.totalRevenue ?? 0),
  };
}

export function productToCake(product: ApiProduct): Cake {
  const description = product.description?.trim() ?? "";
  return {
    id: String(product.id),
    productId: product.id,
    name: product.name,
    tagline: firstSentence(description) || "เบเกอรีพรีเมียมจาก บ้านกล่องเค้ก",
    price: product.price,
    image: product.image_url?.trim() ?? "",
    description,
    storage: "เก็บในตู้เย็น 2–8°C แนะนำทานภายใน 24 ชั่วโมง",
    salesCount: product.sales_count,
    totalRevenue: product.total_revenue,
  };
}

export function productsToCakes(products: ApiProduct[]): Cake[] {
  return products.map(productToCake);
}

export function findCakeById(cakes: Cake[], id: string) {
  return cakes.find((c) => c.id === id);
}
