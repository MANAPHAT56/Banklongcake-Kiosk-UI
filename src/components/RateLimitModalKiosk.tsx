/**
 * RateLimitModalKiosk
 * ────────────────────
 * Optimised for 1280 × 800 kiosk displays.
 * Large touch targets, generous typography, landscape layout.
 * Uses the same CSS variable tokens as the rest of the kiosk UI
 * (--accent, --shadow-glow, bg-card, bg-gradient-soft, etc.)
 */

import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShoppingBag, X } from "lucide-react";
import { useRateLimitCountdown } from "./useRateLimitCountdown";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Seconds to count down before re-enabling the retry button. Default: 30 */
  cooldownSeconds?: number;
};

export function RateLimitModalKiosk({ open, onClose, cooldownSeconds = 30 }: Props) {
  const { remaining, progress } = useRateLimitCountdown(open, cooldownSeconds);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // offset shrinks from full → 0 as time runs out (arc fills)
  const strokeDashoffset = circumference * progress;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-xl"
          style={{ background: "color-mix(in oklab, var(--accent) 30%, transparent)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            /* landscape card: left = icon/countdown, right = text/action */
            className="relative grid grid-cols-[340px_1fr] h-[420px] w-[820px] overflow-hidden rounded-[2.5rem] bg-card shadow-[var(--shadow-glow)]"
          >
            {/* ── close ── */}
            <button
              onClick={onClose}
              aria-label="ปิด"
              className="absolute right-6 top-6 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)] transition hover:bg-secondary active:scale-95"
            >
              <X size={32} strokeWidth={2.5} />
            </button>

            {/* ── left panel: gradient + countdown ring ── */}
            <div className="bg-gradient-soft flex flex-col items-center justify-center gap-6 p-10">
              {/* ring */}
              <div className="relative flex h-[140px] w-[140px] items-center justify-center">
                <svg
                  className="absolute inset-0 -rotate-90"
                  width="140"
                  height="140"
                  viewBox="0 0 140 140"
                >
                  <circle
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke="var(--secondary)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="font-display text-5xl font-bold text-accent leading-none">
                    {remaining}
                  </span>
                  <span className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    วินาที
                  </span>
                </div>
              </div>

              {/* badge */}
              <div className="flex items-center gap-2 rounded-full bg-card px-5 py-2.5 shadow-[var(--shadow-soft)]">
                <ShoppingBag size={18} className="text-accent" />
                <span className="text-sm font-bold text-foreground">คำสั่งซื้อถี่เกินไป</span>
              </div>
            </div>

            {/* ── right panel: text + action ── */}
            <div className="flex flex-col justify-center gap-6 px-10 py-8 pr-20">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  Rate Limit
                </p>
                <h2 className="mt-2 font-display text-4xl leading-tight text-foreground">
                  มีการส่งคำสั่งซื้อ<br />ถี่เกินไป
                </h2>
                <p className="mt-4 text-base font-semibold leading-7 text-muted-foreground">
                  เพื่อป้องกันความผิดพลาดและรักษาความเสถียรของระบบ
                  กรุณารอสักครู่ก่อนทำรายการใหม่อีกครั้ง
                </p>
              </div>

              {/* status chip */}
              <div className="inline-flex items-center gap-3 self-start rounded-2xl border-2 border-dashed border-border bg-secondary/50 px-5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <Clock size={18} className="text-accent" />
                </div>
                <p className="text-base font-semibold text-foreground">
                  {remaining > 0 ? (
                    <>
                      สั่งซื้อได้อีกครั้งใน{" "}
                      <span className="text-accent font-bold">{remaining} วินาที</span>
                    </>
                  ) : (
                    <span className="text-accent font-bold">พร้อมสั่งซื้อแล้ว!</span>
                  )}
                </p>
              </div>

              {/* action */}
              <button
                onClick={onClose}
                disabled={remaining > 0}
                className="h-16 w-full rounded-2xl bg-accent text-base font-bold text-white shadow-[var(--shadow-glow)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {remaining > 0 ? `รอ ${remaining} วินาที...` : "ลองใหม่อีกครั้ง"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}