import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Cake } from "@/types/cake";
import { CakeImage } from "./CakeImage";

export function CakeCard({ cake, index = 0 }: { cake: Cake; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05 }}
    >
      <Link
        to="/cakes/$id"
        params={{ id: cake.id }}
        className="group block bg-card rounded-3xl overflow-hidden shadow-card border-2 border-secondary/40 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-bubble focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
      >
        <CakeImage src={cake.image} alt={cake.name} className="aspect-square w-full" />
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base sm:text-lg truncate">{cake.name}</h3>
              <p className="text-xs sm:text-sm text-foreground/60 truncate">{cake.tagline}</p>
            </div>
            <p className="font-display font-bold text-accent text-base sm:text-lg whitespace-nowrap">
              ฿{cake.price}
            </p>
          </div>
          <p className="mt-3 text-xs font-semibold text-accent group-hover:underline text-right">
            ดูรายละเอียด →
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
