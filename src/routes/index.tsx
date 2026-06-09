import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MapPin, Clock, Heart, ShieldCheck, ChevronDown, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CakeCard } from "@/components/CakeCard";
import { MachineCard } from "@/components/MachineCard";
import { useProducts } from "@/hooks/useProducts";
import { useBestSellerProducts } from "@/hooks/useBestSellerProducts";
import { useMachines } from "@/hooks/useMachines";
import mascot from "@/assets/mascot.png";
import sticker from "@/assets/sticker-strawberry.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "บ้านกล่องเค้ก — เค้กสดใหม่ ตลอด 24 ชม." },
      {
        name: "description",
        content: "ตู้เวนดิ้งเค้กพรีเมียมสไตล์คาวาอิ สต็อกอัปเดตจากระบบจริง เปิด 24 ชั่วโมง",
      },
      { property: "og:title", content: "บ้านกล่องเค้ก — เค้กสดใหม่ ตลอด 24 ชม." },
      { property: "og:description", content: "ตู้เวนดิ้งเค้กพรีเมียม สต็อกอัปเดตแบบเรียลไทม์" },
    ],
  }),
  component: HomePage,
});

const faqs = [
  {
    q: "เค้กสดแค่ไหน?",
    a: "เบเกอรีของเราอบและเติมท็อปปิ้งทุกเช้า แล้วเติมสต็อกในตู้ก่อนเมืองตื่น — ไม่มีเค้กค้างในตู้เกิน 24 ชั่วโมง",
  },
  {
    q: "ชำระเงินที่ตู้อย่างไร?",
    a: "แตะเลือกเค้ก สแกน QR ด้วยแอปธนาคาร ประตูจะเปิดให้รับสินค้า ไม่ต้องสมัครสมาชิก หรือเเสกนคิวอาร์โค้ดที่ตู้ผ่านปุ่มสั่งผ่านมือถือในหน้าจอตู้เพื่อเปิดหน้าเมนูเเละสั่งซื้อในอุปกรณ์ของคุณ",
  },
  {
    q: "สั่งเค้กพิเศษได้ไหม?",
    a: "เค้กวันเกิดและงานอีเวนต์สั่งล่วงหน้าได้ทาง DM Facebook ของเรา",
  },
];

function HomePage() {
  const { cakes, loading } = useProducts();
  const { cakes: bestSellerCakes, loading: bestSellersLoading } = useBestSellerProducts(4);
  const { machines, loading: machinesLoading } = useMachines();
  const featured = cakes.slice(0, 8);

  return (
    <>
      <SiteHeader />

      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-10 sm:pt-16 lg:pt-24 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticker-chip mx-auto lg:mx-0"
            >
              <Sparkles className="size-3.5" /> สดใหม่ทุกวัน · เปิด 24 ชม.
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] text-balance"
            >
              เค้กสด
              <br />
              <span className="bg-gradient-pink bg-clip-text text-transparent">ทุกที่</span> ทุกเวลา
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 text-base sm:text-lg text-foreground/70 max-w-xl mx-auto lg:mx-0"
            >
              ตู้เวนดิ้งที่น่ารักที่สุดในเมือง — เค้กพรีเมียมจากเชฟขนมของเรา
              {machines.length > 0
                ? ` มี ${machines.length} จุดตั้งตู้ — เช็กสต็อกก่อนไปซื้อได้`
                : " อัปเดตเมนูและสต็อกจากระบบจริง"}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              <Link to="/cakes" className="bubble-btn">
                ดูเมนูเค้ก <ArrowRight className="size-4" />
              </Link>
              <a href="#promotions" className="bubble-btn-soft">
                โปรโมชัน
              </a>
            </motion.div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { icon: Heart, label: "อบด้วยมือ" },
                { icon: Clock, label: "สดทุกวัน" },
                { icon: ShieldCheck, label: "วัตถุดิบจริง" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <div className="mx-auto size-12 rounded-2xl bg-card shadow-card grid place-items-center text-accent">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm font-semibold text-foreground/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative order-1 lg:order-2 flex justify-center">
            <motion.div
              className="absolute -top-4 -left-2 sm:left-6 z-10"
              animate={{ y: [0, -10, 0], rotate: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <img src={sticker} alt="" width={88} height={88} className="size-16 sm:size-24 drop-shadow-lg" />
            </motion.div>
            <motion.div
              className="absolute bottom-6 -right-2 sm:right-4 z-10"
              animate={{ y: [0, -14, 0], rotate: [8, -8, 8] }}
              transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
            >
              <img src={sticker} alt="" width={64} height={64} className="size-12 sm:size-20 drop-shadow-lg" />
            </motion.div>

            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 16, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute inset-0 -z-10 blur-3xl rounded-full bg-primary/40 scale-90" aria-hidden />
              <motion.img
                src={mascot}
                alt="มาสคอตหมี Cake Bin"
                width={520}
                height={520}
                fetchPriority="high"
                className="w-64 sm:w-80 md:w-96 lg:w-[28rem] xl:w-[32rem] drop-shadow-[0_30px_50px_rgba(255,92,147,0.35)]"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Section eyebrow="เมนู" title="เค้กขายดี" subtitle="เมนูยอดนิยมจากยอดขายจริงหน้าตู้">
        {bestSellersLoading && bestSellerCakes.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-10 animate-spin text-accent" />
          </div>
        ) : bestSellerCakes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellerCakes.map((c, i) => (
              <CakeCard key={c.id} cake={c} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-center text-foreground/60 py-8">ยังไม่มีข้อมูลเค้กขายดี</p>
        )}
      </Section>

      <section id="promotions" className="px-4 sm:px-6 lg:px-10 mt-20">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-6">
          {[
            { title: "ชั่วโมงสีชมพู", body: "ทุกวัน 15:00–17:00 ลด 20% เมนูมินิที่ตู้ทุกแห่ง", tag: "รายวัน" },
            { title: "กล่องเพื่อนรัก", body: "ซื้อเค้กซิกเนเจอร์ 2 ชิ้น ลด ฿40 — แบ่งกันหรือกินคนเดียวก็ได้", tag: "จำกัด" },
          ].map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl p-7 sm:p-9 bg-gradient-pink text-primary-foreground shadow-bubble"
            >
              <span className="sticker-chip !bg-card/95 !text-accent">{p.tag}</span>
              <h3 className="mt-4 font-display font-bold text-2xl sm:text-3xl">{p.title}</h3>
              <p className="mt-2 text-primary-foreground/90 max-w-sm">{p.body}</p>
              <Link
                to="/cakes"
                className="mt-5 inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline"
              >
                สั่งเลย <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Section
        eyebrow="เมนู"
        title="เค้กแนะนำ"
        subtitle="คัดจากสต็อกในตู้วันนี้"
        action={
          <Link to="/cakes" className="bubble-btn-soft text-sm">
            ดูทั้งหมด →
          </Link>
        }
      >
        {loading && cakes.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-10 animate-spin text-accent" />
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {featured.map((c, i) => (
              <CakeCard key={c.id} cake={c} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-center text-foreground/60 py-8">ยังไม่มีสินค้าในตู้ กรุณาลองใหม่ภายหลัง</p>
        )}
      </Section>

      <Section eyebrow="เรื่องราว" title="ตู้เล็กๆ แห่งความสุข">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-foreground/75 text-base sm:text-lg leading-relaxed">
            <p>
              Cake Bin เริ่มจากตู้สีชมพูตู้เดียวในซอยกรุงเทพฯ — มุมที่ต้องการความหวานตอนตีสอง
            </p>
            <p>
              วันนี้ทีมเบเกอรีของเราอบเค้กทุกเช้าและเติมสต็อกในตู้ก่อนเมืองตื่น สูตรเดิม เนื้อนุ่มเดิม แค่หาเจอง่ายขึ้น
            </p>
            <p className="font-display text-accent font-bold text-xl">เปิด 24 ชม. สดเสมอ สีชมพูเสมอ 🍓</p>
          </div>
          <div className="relative">
            <motion.img
              src={mascot}
              alt=""
              width={400}
              height={400}
              className="size-64 sm:size-80 mx-auto"
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
        </div>
      </Section>

      <Section
        eyebrow="ค้นหาตู้"
        title="เปิด 24 ชม. ตลอดปี"
        subtitle="เลือกตู้แล้วดูสต็อกก่อนออกจากบ้าน"
        action={
          <Link to="/locations" className="bubble-btn-soft text-sm hidden sm:inline-flex">
            ดูทั้งหมด →
          </Link>
        }
      >
        {machinesLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-10 animate-spin text-accent" />
          </div>
        ) : machines.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {machines.slice(0, 3).map((m, i) => (
              <MachineCard key={m.machine_uuid} machine={m} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-center text-foreground/60 py-6">ยังไม่มีตู้ในระบบ</p>
        )}
        <Link to="/locations" className="bubble-btn mt-8 inline-flex sm:hidden justify-center w-full max-w-xs mx-auto">
          ดูจุดตั้งตู้ทั้งหมด
        </Link>
      </Section>

      <Section id="faq" eyebrow="คำถาม" title="คำถามที่พบบ่อย">
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              className="group bg-card rounded-3xl p-5 sm:p-6 border-2 border-secondary/50 shadow-card open:border-primary/40"
              {...(i === 0 && { open: true })}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <span className="font-display font-bold text-base sm:text-lg">{f.q}</span>
                <ChevronDown className="size-5 text-accent transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-foreground/70 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <SiteFooter />
    </>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  action,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="px-4 sm:px-6 lg:px-10 mt-20 sm:mt-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            {eyebrow && (
              <p className="text-accent font-bold text-sm uppercase tracking-wider">{eyebrow}</p>
            )}
            <h2 className="mt-1 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-balance">{title}</h2>
            {subtitle && <p className="mt-2 text-foreground/70 max-w-xl">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}
