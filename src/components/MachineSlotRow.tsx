import { Link } from "@tanstack/react-router";
import type { ApiSlot } from "@/types/api";
import { CakeImage } from "./CakeImage";

export function MachineSlotRow({ slot }: { slot: ApiSlot }) {
  const product = slot.product;
  const inStock = product != null && slot.stock_quantity > 0;
  const outOfStock = product != null && slot.stock_quantity === 0;

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border-2 p-3 sm:p-4 ${
        !product
          ? "border-dashed border-secondary/60 bg-secondary/20"
          : outOfStock
            ? "border-destructive/30 bg-destructive/5"
            : slot.stock_quantity <= 2
              ? "border-accent/40 bg-accent/5"
              : "border-secondary/50 bg-card"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-display font-bold text-accent">
        {slot.slot_number}
      </span>

      {product ? (
        <>
          <CakeImage
            src={product.image_url ?? ""}
            alt={product.name}
            className="size-14 sm:size-16 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold truncate">{product.name}</p>
            <p className="text-sm text-accent font-bold">฿{product.price}</p>
            <p className="mt-1 text-xs font-semibold">
              {!inStock ? (
                <span className="text-destructive">หมดแล้ว</span>
              ) : slot.stock_quantity <= 2 ? (
                <span className="text-accent">เหลือ {slot.stock_quantity} ชิ้น</span>
              ) : (
                <span className="text-success">มี {slot.stock_quantity} ชิ้น</span>
              )}
            </p>
          </div>
          {inStock && (
            <Link
              to="/cakes/$id"
              params={{ id: String(product.id) }}
              className="shrink-0 text-xs font-bold text-accent hover:underline"
            >
              ดูเมนู
            </Link>
          )}
        </>
      ) : (
        <p className="text-sm text-foreground/50">ช่องว่าง — ยังไม่มีสินค้า</p>
      )}
    </div>
  );
}
