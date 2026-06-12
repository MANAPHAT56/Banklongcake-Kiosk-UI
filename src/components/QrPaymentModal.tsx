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
            className="relative grid w-[min(1200px,95vw)] min-h-[600px] grid-cols-1 overflow-hidden rounded-[2.5rem] bg-background shadow-2xl md:grid-cols-2"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-6 top-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-card hover:text-foreground"
              aria-label="close"
            >
              <X className="h-7 w-7" />
            </button>

            {/* ── Left panel: product info ── */}
            <div className="flex flex-col items-center justify-center gap-8 bg-secondary/40 p-12">
              <div className="aspect-square w-full max-w-[340px] overflow-hidden rounded-[2rem] bg-card shadow-sm">
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
                <div className="mt-3 line-clamp-2 text-3xl font-bold text-foreground">
                  {product.name}
                </div>

                <div className="mt-8">
                  <div className="text-sm font-medium text-muted-foreground">
                    {th.paymentAmount}
                  </div>
                  <div className="mt-1 text-5xl font-extrabold text-primary">
                    ฿{amount}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right panel: QR / success ── */}
            <div className="flex flex-col items-center justify-center gap-6 p-12">
              <AnimatePresence mode="wait">
                {state === "waiting" && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex w-full flex-col items-center gap-4"
                  >
                    <h2 className="text-3xl font-bold text-foreground">
                      {th.scanPromptPay}
                    </h2>
                    <p className="text-base text-muted-foreground">
                      {th.autoUpdateOnPay}
                    </p>

                    {/* QR box */}
                    <div className="mt-4 flex aspect-square w-full max-w-[360px] items-center justify-center rounded-[2rem] border bg-card p-5 shadow-sm">
                      {starting ? (
                        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
                      ) : promptPayImage ? (
                        <img
                          src={promptPayImage}
                          alt="PromptPay QR"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-base font-medium text-muted-foreground">
                          {th.noPromptPayQr}
                        </span>
                      )}
                    </div>

                    {/* ⏱️ countdown 2 นาที */}
                    <div
                      className={`mt-4 text-center text-lg font-medium tabular-nums transition-colors ${
                        isUrgent
                          ? "animate-pulse text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      กรุณาชำระเงินภายใน{" "}
                      <span className="font-bold">
                        {mm}:{ss}
                      </span>{" "}
                      นาที
                    </div>

                    {(error || connectionError) && (
                      <div className="mt-2 text-base font-semibold text-destructive">
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

