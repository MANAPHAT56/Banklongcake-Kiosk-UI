import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CakeCard } from "@/components/CakeCard";
import { useProducts } from "@/hooks/useProducts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/cakes/")({
  head: () => ({
    meta: [
      { title: "เค้กทั้งหมด — บ้านกล่องเค้ก" },
      {
        name: "description",
        content: "เลือกดูเมนูเค้กจาก บ้านกล่องเค้ก อัปเดตจากระบบสินค้าจริง",
      },
      { property: "og:title", content: "เค้กทั้งหมด — บ้านกล่องเค้ก" },
      { property: "og:description", content: "เมนูเค้ก บ้านกล่องเค้ก" },
    ],
  }),
  component: CakesPage,
});

const PAGE_SIZE = 10;

const sortOptions = {
  newest: { sortBy: "created_at", sortOrder: "desc" as const, label: "ใหม่สุด" },
  best: { sortBy: "sales_count", sortOrder: "desc" as const, label: "ขายดีสุด" },
  price_asc: { sortBy: "price", sortOrder: "asc" as const, label: "ราคาต่ำ -> สูง" },
  price_desc: { sortBy: "price", sortOrder: "desc" as const, label: "ราคาสูง -> ต่ำ" },
};

type SortKey = keyof typeof sortOptions;

function getVisiblePages(currentPage: number, totalPages: number) {
  const maxButtons = 5;
  const pageCount = Math.min(totalPages, maxButtons);
  const start = Math.min(
    Math.max(currentPage - Math.floor(maxButtons / 2), 1),
    Math.max(totalPages - maxButtons + 1, 1),
  );

  return Array.from({ length: pageCount }, (_, index) => start + index);
}

function CakesPage() {
  // Initialize input and filters from URL so returning restores state
  const [q, setQ] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("q") ?? "";
    } catch {
      return "";
    }
  });
  const [search, setSearch] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("q") ?? "";
    } catch {
      return "";
    }
  });
  // Initialize page from URL `?page=` so returning from detail preserves pagination
  const [page, setPage] = useState(() => {
    try {
      const p = Number(new URLSearchParams(window.location.search).get("page"));
      return Number.isFinite(p) && p > 0 ? Math.max(1, Math.floor(p)) : 1;
    } catch {
      return 1;
    }
  });
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    try {
      const s = new URLSearchParams(window.location.search).get("sort");
      return (s as SortKey) ?? "newest";
    } catch {
      return "newest";
    }
  });
  const sort = sortOptions[sortKey];
  const { cakes, meta, loading, error, reload } = useProducts({
    page,
    limit: PAGE_SIZE,
    search,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  });
  const total = meta?.total ?? 0;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const firstItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, total);
  const pageNumbers = getVisiblePages(page, totalPages);

  useEffect(() => {
    if (meta?.totalPages && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta?.totalPages, page]);

  // Keep page, search and sort in the URL so navigation back/forward restores filters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));

      if (search && search.trim() !== "") params.set("q", search.trim());
      else params.delete("q");

      // Only persist sort when it's not the default to keep URLs clean
      if (sortKey && sortKey !== "newest") params.set("sort", sortKey);
      else params.delete("sort");

      const searchStr = params.toString();
      const newUrl = searchStr ? `${window.location.pathname}?${searchStr}` : window.location.pathname;
      // Use replaceState so browser history isn't polluted when switching pages within list
      window.history.replaceState(null, "", newUrl);
    } catch {
      // ignore URL sync errors
    }
  }, [page, search, sortKey]);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <>
      <SiteHeader />
      <section className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <p className="text-accent font-bold text-sm uppercase tracking-wider">เมนู</p>
            <h1 className="mt-2 font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-balance">
              เค้กทุกแบบ สดใหม่ทุกวัน
            </h1>
            <p className="mt-3 text-foreground/70">ซื้อและชำระเงินได้ที่หน้าตู้ บ้านกล่องเค้ก เท่านั้น</p>
          </motion.div>

          {error && (
            <div className="mt-8 text-center">
              <p className="text-destructive font-semibold">{error}</p>
              <button type="button" onClick={reload} className="bubble-btn-soft mt-4 inline-flex items-center gap-2">
                <RefreshCw className="size-4" /> ลองใหม่
              </button>
            </div>
          )}

          <form
            className="mt-8 sm:mt-10 max-w-xl mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q.trim());
              setPage(1);
            }}
          >
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาเค้ก..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-card border-2 border-secondary focus:border-primary focus:outline-none text-sm font-medium"
              />
            </label>
          </form>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-foreground/60">
              {total > 0
                ? `แสดง ${firstItem}-${lastItem} จาก ${total} รายการ`
                : "ยังไม่มีสินค้าให้แสดง"}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground/60">เรียงตาม</span>
              <Select
                value={sortKey}
                onValueChange={(value) => {
                  setSortKey(value as SortKey);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-[180px] rounded-full border-2 border-secondary bg-card font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sortOptions).map(([key, option]) => (
                    <SelectItem key={key} value={key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && cakes.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-foreground/60">
              <Loader2 className="size-10 animate-spin text-accent" />
              <p>กำลังโหลดเมนู…</p>
            </div>
          ) : (
            <>
              <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {cakes.map((c, i) => (
                  <CakeCard key={c.id} cake={c} index={i} />
                ))}
              </div>
              {cakes.length === 0 && !loading && (
                <p className="text-center text-foreground/60 mt-16">ไม่พบเค้กที่ค้นหา ลองคำอื่นดูนะ 🍓</p>
              )}
              {totalPages > 1 && (
                <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Product pagination">
                  <button
                    type="button"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1 || loading}
                    className="inline-flex size-10 items-center justify-center rounded-full border-2 border-secondary bg-card text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => goToPage(pageNumber)}
                      disabled={loading}
                      className={
                        pageNumber === page
                          ? "inline-flex size-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground shadow-bubble disabled:opacity-70"
                          : "inline-flex size-10 items-center justify-center rounded-full border-2 border-secondary bg-card font-bold text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                      }
                      aria-current={pageNumber === page ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages || loading}
                    className="inline-flex size-10 items-center justify-center rounded-full border-2 border-secondary bg-card text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
