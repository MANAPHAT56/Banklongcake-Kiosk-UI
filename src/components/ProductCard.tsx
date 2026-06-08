import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { th } from "@/i18n/th";

type Props = { product: Product; onSelect: (p: Product) => void; index: number };

export function ProductCard({ product, onSelect, index }: Props) {
  const disabled = !product.available;
  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onSelect(product)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 180, damping: 18 }}
      whileHover={!disabled ? { y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      disabled={disabled}
      className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl bg-card text-left shadow-[var(--shadow-card)] outline-none ring-accent transition focus-visible:ring-4 disabled:opacity-60"
    >
      {product.tag && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-md">
          {product.tag}
        </span>
      )}
      {disabled && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
          {th.outOfStock}
        </span>
      )}

      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-secondary">
        <motion.img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
          whileHover={!disabled ? { scale: 1.08 } : {}}
          transition={{ duration: 0.4 }}
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${product.available ? "bg-success" : "bg-destructive"}`}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {product.available ? th.inStock : th.unavailable}
            </span>
          </div>
        </div>
        <div className="shrink-0 rounded-2xl bg-gradient-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-soft)]">
          ฿{product.price}
        </div>
      </div>
    </motion.button>
  );
}
