import type { ApiSlot, KioskProduct } from "@/types/kiosk";
import { th } from "@/i18n/th";

export function slotsToKioskProducts(slots: ApiSlot[]): KioskProduct[] {
  return slots
    .filter((slot): slot is ApiSlot & { product: NonNullable<ApiSlot["product"]> } => slot.product != null)
    .map((slot) => ({
      id: slot.product.id,
      slotNumber: slot.slot_number,
      name: slot.product.name,
      price: slot.product.price,
      imageUrl: slot.product.image_url?.trim() ?? "",
      description: slot.product.description?.trim() ?? "",
      ingredients: th.seeProductLabel,
      storage: th.keepRefrigerated,
      freshness: th.madeToday,
      available: slot.stock_quantity > 0,
      stockQuantity: slot.stock_quantity,
    }));
}
