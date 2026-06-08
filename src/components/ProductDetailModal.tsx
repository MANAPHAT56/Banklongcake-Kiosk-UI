import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Leaf, Snowflake, Clock } from "lucide-react";
import type { Product } from "@/data/products";
import { th } from "@/i18n/th";

type Props = {
  product: Product | null;
  onClose: () => void;
  onBuy: (p: Product) => void;
};

export function ProductDetailModal({ product, onClose, onBuy }: Props) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md"
          style={{ background: "color-mix(in oklab, var(--accent) 25%, transparent)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="relative grid h-[85%] w-[85%] grid-cols-[1.1fr_1fr] overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-glow)]"
          >
            <button
              onClick={onClose}
              aria-label={th.close}
              className="absolute right-5 top-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)] transition hover:bg-secondary active:scale-95"
            >
              <X size={28} strokeWidth={2.5} />
            </button>

            <div className="relative overflow-hidden bg-secondary">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.tag && (
                <span className="absolute left-5 top-5 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground shadow-lg">
                  {product.tag}
                </span>
              )}
            </div>

            <div className="flex min-h-0 flex-col gap-4 p-7">
              <div className="min-h-0 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                  {th.premium}
                </p>
                <h2 className="mt-1 font-display text-3xl text-foreground">{product.name}</h2>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-accent">฿{product.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">{th.perPiece}</span>
                </div>

                <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">
                  {product.description}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-2.5">
                  <InfoRow icon={<Leaf size={18} />} label={th.ingredients} value={product.ingredients} />
                  <InfoRow icon={<Snowflake size={18} />} label={th.storage} value={product.storage} />
                  <InfoRow icon={<Clock size={18} />} label={th.freshness} value={product.freshness} />
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm font-semibold text-success">
                    {product.available ? th.availableNow : th.outOfStock}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!product.available}
                onClick={() => onBuy(product)}
                className="flex h-[72px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-primary text-lg font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition disabled:opacity-50"
              >
                <ShoppingBag size={24} />
                {th.buyProduct(product.price)}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-blush/60 p-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card text-accent">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
