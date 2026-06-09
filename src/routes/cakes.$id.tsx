import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Snowflake, AlignLeft } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CakeCard } from "@/components/CakeCard";
import { BuyAtKioskDialog } from "@/components/BuyAtKioskDialog";
import { CakeImage } from "@/components/CakeImage";
import { fetchProductById } from "@/lib/api/client";
import { findCakeById, productToCake } from "@/lib/products";
import { useProducts } from "@/hooks/useProducts";

export const Route = createFileRoute("/cakes/$id")({
  loader: async ({ params }) => {
    const productId = Number.parseInt(params.id, 10);
    if (Number.isNaN(productId)) throw notFound();
    try {
      const product = await fetchProductById(productId);
      return { cake: productToCake(product) };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cake.name} — บ้านกล่องเค้ก` },
          { name: "description", content: loaderData.cake.description || loaderData.cake.tagline },
          { property: "og:title", content: `${loaderData.cake.name} — บ้านกล่องเค้ก` },
          { property: "og:description", content: loaderData.cake.description || loaderData.cake.tagline },
        ]
      : [],
  }), 
  component: CakeDetail,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="font-display font-bold text-3xl">ไม่พบสินค้านี้ 🍰</h1>
        <Link to="/cakes" className="bubble-btn mt-6">
          กลับไปเมนู
        </Link>
      </div>
    </div>
  ),
});

function CakeDetail() {
  const { cake: loaderCake } = Route.useLoaderData();
  const { cakes: liveCakes } = useProducts();
  const cake = findCakeById(liveCakes, loaderCake.id) ?? loaderCake;
  const [showBuy, setShowBuy] = useState(false);
  const related = liveCakes.filter((c) => c.id !== cake.id).slice(0, 4);

  return (
    <>
      <SiteHeader />

      <article className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => {
              try {
                if (window.history.length > 1) window.history.back();
                else window.location.href = "/cakes";
              } catch {
                window.location.href = "/cakes";
              }
            }}
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent font-semibold text-sm"
          >
            <ArrowLeft className="size-4" /> กลับไปเมนูทั้งหมด
          </button>

          <div className="mt-6 grid lg:grid-cols-2 gap-8 lg:gap-14">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <div className="aspect-square rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-secondary/40 shadow-bubble border-4 border-card">
                <CakeImage src={cake.image} alt={cake.name} className="h-full w-full" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-balance">{cake.name}</h1>
              {/* <p className="mt-2 text-lg text-foreground/70">{cake.tagline}</p> */}

              <p className="mt-5 font-display font-bold text-3xl sm:text-4xl text-accent">฿{cake.price}</p>

              {(cake.salesCount ?? 0) > 0 && (
                <p className="mt-2 text-sm text-foreground/60">
                  ขายแล้ว {cake.salesCount} ชิ้น
                  {cake.totalRevenue != null && cake.totalRevenue > 0
                    ? ` · ยอดขายรวม ฿${cake.totalRevenue.toLocaleString("th-TH")}`
                    : ""}
                </p>
              )}

              <div className="mt-5 rounded-2xl bg-secondary/40 p-4">
                <div className="flex items-center gap-2 text-accent">
                  <AlignLeft size={18} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">รายละเอียด</h2>
                </div>
                <p className="mt-2 text-foreground/80 leading-relaxed">
                  {cake.description || "ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้านี้"}
                </p>
              </div>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => setShowBuy(true)} className="bubble-btn flex-1 justify-center">
                  <ShoppingBag className="size-4" /> ซื้อเลย — ฿{cake.price}
                </button>
                <Link to="/locations" className="bubble-btn-soft justify-center">
                  ค้นหาตู้
                </Link>
              </div>

              <div className="mt-8">
                <div className="bg-card rounded-3xl p-5 border-2 border-secondary/50 shadow-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-9 rounded-xl bg-secondary text-accent grid place-items-center">
                      <Snowflake className="size-4" />
                    </div>
                    <h3 className="font-display font-bold">การเก็บรักษา</h3>
                  </div>
                  <p className="text-sm text-foreground/70">{cake.storage}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {related.length > 0 && (
            <section className="mt-20 mb-10">
              <h2 className="font-display font-bold text-3xl sm:text-4xl">เค้กอื่นๆ ที่น่าสนใจ</h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {related.map((c, i) => (
                  <CakeCard key={c.id} cake={c} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <SiteFooter />
      <BuyAtKioskDialog cake={cake} open={showBuy} onClose={() => setShowBuy(false)} />
    </>
  );
}
