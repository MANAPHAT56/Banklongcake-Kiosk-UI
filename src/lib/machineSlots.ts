import type { ApiSlot } from "@/types/api";

export type SlotInventorySummary = {
  totalSlots: number;
  assignedSlots: number;
  inStockSlots: number;
  outOfStockSlots: number;
  emptySlots: number;
  lowStockSlots: number;
  hasAnyStock: boolean;
};

export function summarizeSlotInventory(slots: ApiSlot[]): SlotInventorySummary {
  const assigned = slots.filter((s) => s.product != null);
  const inStock = assigned.filter((s) => s.stock_quantity > 0);
  const outOfStock = assigned.filter((s) => s.stock_quantity === 0);
  const empty = slots.filter((s) => !s.product);
  const lowStock = inStock.filter((s) => s.stock_quantity <= 2);

  return {
    totalSlots: slots.length,
    assignedSlots: assigned.length,
    inStockSlots: inStock.length,
    outOfStockSlots: outOfStock.length,
    emptySlots: empty.length,
    lowStockSlots: lowStock.length,
    hasAnyStock: inStock.length > 0,
  };
}

export function machineStockLabel(summary: SlotInventorySummary) {
  if (summary.assignedSlots === 0) return "ยังไม่มีสินค้าในตู้";
  if (!summary.hasAnyStock) return "สินค้าหมดทุกช่อง";
  if (summary.lowStockSlots > 0) return `มีสินค้า ${summary.inStockSlots} ช่อง · บางช่องใกล้หมด`;
  return `มีสินค้า ${summary.inStockSlots} ช่อง`;
}
