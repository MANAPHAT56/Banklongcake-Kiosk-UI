import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

const items = [
  { Icon: Heart, x: "8%",  y: "12%", size: 22, delay: 0,   color: "text-accent/70" },
  { Icon: Sparkles, x: "92%", y: "18%", size: 20, delay: 0.5, color: "text-primary/70" },
  { Icon: Heart, x: "85%", y: "78%", size: 18, delay: 1,   color: "text-accent/60" },
  { Icon: Sparkles, x: "5%",  y: "82%", size: 16, delay: 1.5, color: "text-primary/60" },
  { Icon: Heart, x: "50%", y: "6%",  size: 14, delay: 0.8, color: "text-primary/50" },
];

export function FloatingDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map(({ Icon, x, y, size, delay, color }, i) => (
        <motion.div
          key={i}
          className={`absolute ${color}`}
          style={{ left: x, top: y }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [10, -10, 10] }}
          transition={{ delay, duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={size} fill="currentColor" strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}
