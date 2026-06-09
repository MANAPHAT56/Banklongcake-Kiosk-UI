import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import mascot from "@/assets/mascot.png";

const links = [
  { to: "/", label: "หน้าแรก" },
  { to: "/cakes", label: "เค้กทั้งหมด" },
  { to: "/locations", label: "ค้นหาตู้" },
  { to: "/about", label: "เรื่องราวของเรา" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/75 border-b border-secondary/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.img
            src={mascot}
            alt="มาสคอต บ้านกล่องเค้ก"
            width={48}
            height={48}
            className="size-10 sm:size-12 drop-shadow-[0_4px_10px_rgba(255,92,147,0.35)]"
            whileHover={{ rotate: [-5, 5, -5, 0], transition: { duration: 0.6 } }}
          />
          <span className="font-display font-bold text-xl sm:text-2xl tracking-tight">
            บ้านกล่อง<span className="text-accent">เค้ก</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="px-4 py-2 rounded-full font-semibold text-sm text-foreground/80 hover:text-accent hover:bg-secondary/60 transition-colors data-[status=active]:bg-secondary data-[status=active]:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Link to="/cakes" className="bubble-btn !py-2.5 !px-5 text-sm">
            สั่งเลย
          </Link>
        </div>

        <button
          aria-label="เปิดเมนู"
          className="md:hidden size-11 grid place-items-center rounded-full bg-secondary text-accent"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-secondary/60 bg-background/95 backdrop-blur"
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl font-semibold text-foreground/80 hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/cakes" onClick={() => setOpen(false)} className="bubble-btn justify-center mt-2">
              สั่งเลย
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
