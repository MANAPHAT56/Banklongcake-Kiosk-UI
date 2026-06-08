import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/data/products";
import { th } from "@/i18n/th";
import { ProductCard } from "./ProductCard";

const PAGE_SIZE = 8;

function useGridColumns() {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const update = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      const narrow = window.innerWidth < 900;
      setCols(portrait || narrow ? 2 : 4);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return cols;
}

export function ProductGrid({
  products,
  onSelect,
}: {
  products: Product[];
  onSelect: (p: Product) => void;
}) {
  const [page, setPage] = useState(0);
  const maxCols = useGridColumns();
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const visible = products.slice(start, start + PAGE_SIZE);

  const { gridCols, gridRows } = useMemo(() => {
    const cols = maxCols;
    const rows = Math.max(1, Math.ceil(PAGE_SIZE / cols));
    return { gridCols: cols, gridRows: rows };
  }, [maxCols]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  return (
    <section className="kiosk-grid-section relative z-10 flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 items-stretch gap-4">
        <PagerButton
          dir="left"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        />

        <div className="kiosk-grid-viewport min-h-0 min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="kiosk-product-grid h-full w-full"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
              }}
            >
              {visible.map((p, i) => (
                <ProductCard key={p.id} product={p} onSelect={onSelect} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <PagerButton
          dir="right"
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex h-10 shrink-0 items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={th.page(i + 1)}
              className={`h-2.5 rounded-full transition-all ${
                i === page ? "w-8 bg-accent" : "w-2.5 bg-secondary"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PagerButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled?: boolean;
  onClick: () => void;
}) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? th.prevPage : th.nextPage}
      className="my-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)] transition hover:bg-secondary disabled:pointer-events-none disabled:opacity-25"
    >
      <Icon size={30} strokeWidth={2.5} />
    </motion.button>
  );
}
