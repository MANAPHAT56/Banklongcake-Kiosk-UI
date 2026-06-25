import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Home, Loader2, X } from "lucide-react";
import type { Product } from "@/data/products";
import type { CheckoutResult } from "@/types/kiosk";
import { th } from "@/i18n/th";
import { cancelKioskSwitch } from "@/lib/api/client";

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

const WAITING_TIMEOUT_SECONDS = 120; // 2 นาที

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
  const [waitingSeconds, setWaitingSeconds] = useState(WAITING_TIMEOUT_SECONDS);

  // countdown หลังจ่ายเงินสำเร็จ
  useEffect(() => {
    if (!product || state !== "success") return;
    setSuccessSeconds(10);
    const id = window.setInterval(() => {
      setSuccessSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [product, state]);

  const amount = checkout?.amount ?? product?.price ?? 0;
  const promptPayImage =
    checkout?.promptpay?.image_url_png ?? checkout?.promptpay?.image_url_svg;

  async function handleClose() {
    try {
      if (state === "waiting" && transactionId) {
        await cancelKioskSwitch(transactionId);
      }
    } catch {}
    onClose();
  }

  // 🟢 countdown 2 นาที + auto close เมื่อรอชำระเงินค้างไว้
  useEffect(() => {
    if (!product || state !== "waiting") return;

    setWaitingSeconds(WAITING_TIMEOUT_SECONDS);

    const tick = window.setInterval(() => {
      setWaitingSeconds((s) => Math.max(0, s - 1));
    }, 1000);

    const autoCloseTimer = window.setTimeout(() => {
      handleClose();
    }, WAITING_TIMEOUT_SECONDS * 1000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(autoCloseTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, state, transactionId]);

  const mm = String(Math.floor(waitingSeconds / 60)).padStart(2, "0");
  const ss = String(waitingSeconds % 60).padStart(2, "0");
  const isUrgent = waitingSeconds <= 30;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative grid w-[min(900px,90vw)] grid-cols-1 overflow-hidden rounded-[2rem] bg-background shadow-2xl md:grid-cols-2"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-sm backdrop-blur transition-all hover:bg-destructive/20 hover:scale-105 active:scale-95"
              aria-label="close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* ── Left panel: product info ── */}
            <div className="flex flex-col items-center justify-center gap-6 bg-secondary/30 p-8 md:border-r border-border/50">
              <div className="aspect-square w-full max-w-[240px] overflow-hidden rounded-[1.5rem] bg-card shadow-sm border border-border/50">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="w-full text-center">
                <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {th.selectedItem}
                </div>
                <div className="mt-2 line-clamp-2 text-2xl font-bold text-foreground">
                  {product.name}
                </div>

                <div className="mt-6 flex flex-col items-center rounded-[1.5rem] bg-card p-4 shadow-sm border border-border/50">
                  <div className="text-sm font-medium text-muted-foreground">
                    {th.paymentAmount}
                  </div>
                  <div className="mt-1 text-4xl font-extrabold text-primary">
                    ฿{amount}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right panel: QR / success ── */}
            <div className="flex flex-col items-center justify-center gap-6 p-8">
              <AnimatePresence mode="wait">
                {state === "waiting" && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex w-full flex-col items-center gap-4"
                  >
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-foreground">
                        {th.scanPromptPay}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {th.autoUpdateOnPay}
                      </p>
                    </div>

                    {/* QR box */}
                    <div className="relative mt-2 flex aspect-square w-full max-w-[280px] items-center justify-center rounded-[1.5rem] border-2 border-primary/20 bg-white p-4 shadow-md">
                      {starting ? (
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      ) : promptPayImage ? (
                        <img
                          src={promptPayImage}
                          alt="PromptPay QR"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">
                          {th.noPromptPayQr}
                        </span>
                      )}
                    </div>

                    {/* ⏱️ countdown 2 นาที */}
                    <div
                      className={`mt-4 rounded-full px-4 py-2 text-center text-base font-semibold tabular-nums transition-colors ${
                        isUrgent
                          ? "bg-destructive/10 text-destructive animate-pulse"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      กรุณาชำระเงินภายใน {mm}:{ss} นาที
                    </div>

                    {(error || connectionError) && (
                      <div className="mt-2 text-center text-sm font-semibold text-destructive">
                        {error ?? connectionError}
                      </div>
                    )}
                  </motion.div>
                )}

                {state === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex flex-col items-center gap-5 text-center"
                  >
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-16 w-16 text-primary" strokeWidth={3} />
                    </div>
                    <div className="mt-4 text-3xl font-bold text-foreground">
                      {th.paymentSuccess}
                    </div>
                    <div className="text-lg font-medium text-muted-foreground">
                      {th.dispensingReturn(successSeconds)}
                    </div>
                    <div className="mt-4">
                      <ActionButton
                        onClick={onClose}
                        icon={<Home className="h-5 w-5" />}
                        variant="primary"
                      >
                        {th.backHome}
                      </ActionButton>
                    </div>
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
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-bold transition-transform hover:scale-[1.02] active:scale-95 ${styles}`}
    >
      {icon}
      {children}
    </button>
  );
}

