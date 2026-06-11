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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative grid w-[min(960px,92vw)] grid-cols-1 overflow-hidden rounded-3xl bg-background shadow-2xl md:grid-cols-2"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-card/80 p-2 text-muted-foreground hover:bg-card"
              aria-label="close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* ── Left panel: product info ── */}
            <div className="flex flex-col items-center justify-center gap-4 bg-secondary/40 p-8">
              <div className="aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl bg-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="w-full text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {th.selectedItem}
                </div>
                <div className="mt-1 text-2xl font-semibold text-foreground">
                  {product.name}
                </div>

                <div className="mt-4">
                  <div className="text-xs text-muted-foreground">
                    {th.paymentAmount}
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    ฿{amount}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right panel: QR / success ── */}
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <AnimatePresence mode="wait">
                {state === "waiting" && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex w-full flex-col items-center gap-3"
                  >
                    <h2 className="text-xl font-semibold text-foreground">
                      {th.scanPromptPay}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {th.autoUpdateOnPay}
                    </p>

                    {/* QR box */}
                    <div className="flex aspect-square w-full max-w-[260px] items-center justify-center rounded-2xl border bg-card p-3">
                      {starting ? (
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                      ) : promptPayImage ? (
                        <img
                          src={promptPayImage}
                          alt="PromptPay QR"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {th.noPromptPayQr}
                        </span>
                      )}
                    </div>

                    {/* ⏱️ countdown 2 นาที */}
                    <div
                      className={`mt-1 text-center text-sm font-medium tabular-nums transition-colors ${
                        isUrgent
                          ? "text-destructive animate-pulse"
                          : "text-muted-foreground"
                      }`}
                    >
                      กรุณาชำระเงินภายใน{" "}
                      <span className="font-semibold">
                        {mm}:{ss}
                      </span>{" "}
                      นาที
                    </div>

                    {(error || connectionError) && (
                      <div className="mt-1 text-sm text-destructive">
                        {error ?? connectionError}
                      </div>
                    )}
                  </motion.div>
                )}

                {state === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <div className="rounded-full bg-primary/10 p-4">
                      <Check className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-xl font-semibold text-foreground">
                      {th.paymentSuccess}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {th.dispensingReturn(successSeconds)}
                    </div>
                    <ActionButton
                      onClick={onClose}
                      icon={<Home className="h-4 w-4" />}
                      variant="primary"
                    >
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
    <button
      onClick={onClick}
      className={`mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02] ${styles}`}
    >
      {icon}
      {children}
    </button>
  );
}
