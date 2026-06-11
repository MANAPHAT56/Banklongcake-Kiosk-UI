import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Home, Loader2, RefreshCw, X } from "lucide-react";
import type { Product } from "@/data/products";
import type { CheckoutResult } from "@/types/kiosk";
import { th } from "@/i18n/th";
import {cancelKioskSwitch} from "@/lib/api/client";
export type PayState = "waiting" | "success" | "dispensing" | "complete";

type Props = {
  product: Product | null;
  checkout: CheckoutResult | null;
  state: PayState;
  starting?: boolean;
  error?: string | null;
  connectionError?: string | null;
      transactionId?: number | null;
  onClose: () => void;
  onCancel: () => void;
  onRefresh: () => void;

};

export function QrPaymentModal({
  product,
  checkout,
  state,
  starting = false,
  error,
  connectionError,
  onClose,
  onCancel,
  onRefresh,
    transactionId,
}: Props) {
  const [successSeconds, setSuccessSeconds] = useState(10);
  useEffect(() => {
    if (!product || state !== "success") return;
    setSuccessSeconds(10);
    const id = window.setInterval(() => {
      setSuccessSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [product, state]);

  const amount = checkout?.amount ?? product?.price ?? 0;
  const promptPayImage = checkout?.promptpay?.image_url_png ?? checkout?.promptpay?.image_url_svg;
async function handleClose() {
  try {
    if (
      state === "waiting" &&
      transactionId
    ) {
      await cancelKioskSwitch(
        transactionId,
      );
    }
  } catch {}

  onClose();
}
  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-lg"
          style={{ background: "color-mix(in oklab, var(--accent) 35%, transparent)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="relative grid h-full max-h-[900px] w-full max-w-[1180px] grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-glow)]"
          >
            {/* ปุ่มกากบาทที่เพิ่ม onCancel เข้าไปร่วมกับ onClose */}
            <button
              onClick={() => {
                handleClose();
              }}
              aria-label={th.closePayment}
              className="absolute right-5 top-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)] transition hover:bg-secondary active:scale-95"
            >
              <X size={28} strokeWidth={2.5} />
            </button>

            <div className="flex min-h-0 flex-col gap-4 bg-gradient-soft p-7">
              <div className="min-h-0 overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="aspect-square h-full w-full object-cover"
                />
              </div>
              <div className="shrink-0">
                <p className="text-xs font-bold text-accent">{th.selectedItem}</p>
                <h3 className="mt-1 line-clamp-2 font-display text-2xl text-foreground">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{th.paymentAmount}</span>
                  <span className="text-3xl font-bold text-accent">฿{amount}</span>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col items-center justify-center p-7 text-center">
              <AnimatePresence mode="wait">
             {state === "waiting" && (
  <motion.div
    key="waiting"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex w-full flex-col items-center"
  >
    <p className="font-display text-2xl text-foreground">
      {th.scanPromptPay}
    </p>

    <p className="mt-1 text-sm text-muted-foreground">
      {th.autoUpdateOnPay}
    </p>

    <div className="relative mt-5 rounded-3xl bg-card p-4 shadow-[var(--shadow-glow)]">
      {starting ? (
        <div className="flex h-[300px] w-[300px] items-center justify-center rounded-2xl bg-secondary">
          <Loader2 size={56} className="animate-spin text-accent" />
        </div>
      ) : promptPayImage ? (
        <img
          src={promptPayImage}
          alt={th.promptPayQr}
          width={350}
          height={350}
          className="h-[300px] w-[300px] rounded-2xl bg-white"
        />
      ) : (
        <div className="flex h-[300px] w-[300px] items-center justify-center rounded-2xl bg-secondary p-8 text-sm font-bold text-destructive">
          {th.noPromptPayQr}
        </div>
      )}
    </div>

    {(error || connectionError) && (
      <p className="mt-3 text-sm font-semibold text-destructive">
        {error ?? connectionError}
      </p>
    )}
  </motion.div>
)}

                {state === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12 }}
                      className="flex h-32 w-32 items-center justify-center rounded-full bg-success text-success-foreground shadow-[var(--shadow-glow)]"
                    >
                      <Check size={64} strokeWidth={3} />
                    </motion.div>
                    <h3 className="mt-6 font-display text-3xl text-foreground">
                      {th.paymentSuccess}
                    </h3>
                    <p className="mt-2 text-base font-medium text-muted-foreground">
                      {th.dispensingReturn(successSeconds)}
                    </p>
                    <ActionButton onClick={onClose} icon={<Home size={18} />} variant="primary">
                      {th.backHome}
                    </ActionButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionButton({
  children,
  onClick,
  icon,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "ghost" | "primary";
}) {
  const styles =
    variant === "primary"
      ? "bg-gradient-primary text-primary-foreground shadow-[var(--shadow-soft)]"
      : variant === "ghost"
        ? "bg-transparent text-muted-foreground hover:bg-secondary"
        : "bg-card text-foreground shadow-[var(--shadow-soft)]";
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`mt-5 flex h-14 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition ${styles}`}
    >
      {icon}
      {children}
    </motion.button>
  );
}