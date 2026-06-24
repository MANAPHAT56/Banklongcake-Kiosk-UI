import { motion } from "framer-motion";
import { CakeSlice, Clock, Smartphone, Sparkles } from "lucide-react";
import { th } from "@/i18n/th";

export function HeroBanner({ onMobileOrder }: { onMobileOrder?: () => void }) {
  return (
    <header className="relative z-10 flex h-[16vh] min-h-[120px] max-h-[160px] shrink-0 items-center justify-between gap-4 px-6 py-3 portrait:min-h-[108px] portrait:px-4">
      <div className="flex min-w-0 items-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-[var(--shadow-glow)]"
        >
          <CakeSlice size={34} className="text-primary-foreground" strokeWidth={2.4} />
          <motion.div
            className="absolute -right-1 -top-1"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={14} className="text-cream" fill="currentColor" />
          </motion.div>
        </motion.div>

        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl leading-none text-foreground">
            บ้านกล่อง<span className="text-accent">เค้ก</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {th.brandTagline}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {onMobileOrder && (
          <motion.button
            type="button"
            onClick={onMobileOrder}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex h-12 items-center gap-2 rounded-full bg-card px-5 text-sm font-bold text-foreground shadow-[var(--shadow-soft)] transition hover:bg-secondary active:scale-95"
          >
            <Smartphone size={18} className="text-accent" />
            {th.orderViaMobile}
          </motion.button>
        )}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-[var(--shadow-soft)]"
        >
          <Sparkles size={16} className="text-accent" />
          <span className="text-sm font-bold text-foreground">{th.freshDaily}</span>
        </motion.div>
      </div>
    </header>
  );
}
