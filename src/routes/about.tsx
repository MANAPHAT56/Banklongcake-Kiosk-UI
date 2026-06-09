import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Sparkles, Cookie, Award } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import mascot from "@/assets/mascot.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "เรื่องราวของเรา — บ้านกล่องเค้ก" },
      {
        name: "description",
        content: "จากตู้สีชมพูตู้เดียว สู่เครือข่าย บ้านกล่องเค้ก ทั่วกรุงเทพฯ เบเกอรีสดใหม่ 24 ชม.",
      },
      { property: "og:title", content: "เรื่องราวของเรา — บ้านกล่องเค้ก" },
      { property: "og:description", content: "จากตู้สีชมพูตู้เดียว สู่เครือข่าย บ้านกล่องเค้ก" },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Heart, title: "ทำด้วยใจ", body: "เค้กทุกชิ้นตกแต่งด้วยมือโดยทีมเบเกอรี ไม่ใช่สายพาน" },
  { icon: Cookie, title: "สดเสมอ", body: "เติมสต็อกทุกเช้าก่อนพระอาทิตย์ขึ้น ไม่ค้างในตู้เกิน 24 ชม." },
  { icon: Sparkles, title: "คาวาอิในใจ", body: "ความหวานควรรู้สึกเหมือนกอด — แบรนด์ของเรายึดแบบนี้" },
  { icon: Award, title: "วัตถุดิบพรีเมียม", body: "ครีมฮอกไกโด มัทฉะอุจิ มะม่วงอัลฟองโซ เราไม่ลดคุณภาพ" },
];

function AboutPage() {
  return (
    <>
      <SiteHeader />
      <section className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <motion.img
            src={mascot}
            alt="มาสคอต บ้านกล่องเค้ก"
            width={240}
            height={240}
            className="mx-auto size-40 sm:size-56"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <h1 className="mt-6 font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-balance">
            ตู้เล็กๆ สำหรับทุกความอยากหวาน
          </h1>
          <p className="mt-5 text-foreground/70 text-lg max-w-2xl mx-auto">
            เราเชื่อว่าขนมไม่ควรมีเวลาปิด — เลยสร้างตู้เวนดิ้งที่น่ารักที่สุด
            และเติมเค้กสวยที่สุดในเมือง
          </p>
        </div>

        <div className="mx-auto max-w-7xl mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-3xl p-6 border-2 border-secondary/50 shadow-card text-center"
            >
              <div className="mx-auto size-14 rounded-2xl bg-gradient-pink grid place-items-center text-primary-foreground shadow-bubble">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-4 font-display font-bold text-lg">{title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto max-w-3xl mt-20 bg-gradient-pink rounded-3xl p-10 text-center text-primary-foreground shadow-bubble">
          <h2 className="font-display font-bold text-3xl sm:text-4xl">มาทักทายกัน 🍓</h2>
          <p className="mt-3 max-w-xl mx-auto">หาตู้ บ้านกล่องเค้ก ใกล้บ้าน แล้วพบมาสคอตของเราตัวจริง</p>
          <Link to="/locations" className="bubble-btn-soft mt-6">
            ค้นหาตู้
          </Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
