import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Wifi, QrCode, Loader2 } from "lucide-react";
import type { Product } from "@/data/products";
import type { CheckoutResult } from "@/types/kiosk";
import { createMobileSession, invalidateMobileSession } from "@/lib/api/client";
import { usePaymentWebSocket } from "@/hooks/usePaymentWebSocket";
import { th } from "@/i18n/th";

type Props = {
  open: boolean;
  machineUuid: string | null;
  product: Product | null;
  products: Product[];
  onClose: () => void;
  onPayAtKiosk: (product: Product, checkout: CheckoutResult) => void;
  onMobilePaid: (product: Product, checkout: CheckoutResult) => void;
};

export function MobileOrderModal({
  open,
  machineUuid,
  product,
  products,
  onClose,
  onPayAtKiosk,
  onMobilePaid,
}: Props) {
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handledStatusRef = useRef<string | null>(null);
  const hasRequestedRef = useRef<boolean>(false);
  const transactionId = checkout?.transaction_id;
  const { paymentStatus, connectionError } = usePaymentWebSocket(
    machineUuid,
    transactionId,
    Boolean(open && machineUuid)
  );

  useEffect(() => {
    if (!open) {
      setCheckout(null);
      setError(null);
      handledStatusRef.current = null;
      hasRequestedRef.current = false;
      return;
    }

    if (!machineUuid || !product) {
      setError(th.noProductOrMachine);
      return;
    }

    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    let cancelled = false;
    setLoading(true);
    setError(null);
    handledStatusRef.current = null;

    createMobileSession(machineUuid, product.slotNumber ?? product.id)
      .then((result) => {
        if (!cancelled) setCheckout(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : th.createSessionFailed);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, machineUuid, product, products]);

  useEffect(() => {
    if (!open || !product || !checkout || !paymentStatus) return;
    if (handledStatusRef.current === paymentStatus) return;

    if (paymentStatus === "SWITCH_TO_KIOSK") {
      handledStatusRef.current = paymentStatus;
      onPayAtKiosk(product, checkout);
      return;
    }

    if (paymentStatus === "SUCCEEDED") {
      handledStatusRef.current = paymentStatus;
      onMobilePaid(product, checkout);
      return;
    }

    if (paymentStatus === "CANCELLED") {
      handledStatusRef.current = paymentStatus;
      return;
    }
  }, [checkout, onMobilePaid, onPayAtKiosk, open, paymentStatus, product]);

  const mobileUrl = checkout?.qr_url ?? "";
  const qrUrl = mobileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=10&data=${encodeURIComponent(
        mobileUrl,
      )}&color=FF5C93&bgcolor=FFFFFF`
    : "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center backdrop-blur-lg"
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
            className="relative grid h-[92%] w-[92%] grid-cols-[1.1fr_0.9fr] overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-glow)]"
          >
            <button
              onClick={onClose}
              aria-label={th.close}
              className="absolute right-5 top-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)] transition hover:bg-secondary active:scale-95"
            >
              <X size={28} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center justify-center gap-5 bg-gradient-soft p-7 text-center">
              <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-[var(--shadow-soft)]">
                <Smartphone size={18} className="text-accent" />
                <span className="text-sm font-bold text-foreground">{th.mobileOrderTitle}</span>
              </div>

              <p className="font-display text-2xl text-foreground">{th.scanMobileQr}</p>

              <div className="relative rounded-3xl bg-card p-4 shadow-[var(--shadow-glow)]">
                {loading ? (
                  <div className="flex h-[280px] w-[280px] items-center justify-center rounded-2xl bg-secondary">
                    <Loader2 size={56} className="animate-spin text-accent" />
                  </div>
                ) : qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={th.mobileOrderQr}
                    width={350}
                    height={350}
                    className="h-[280px] w-[280px] rounded-2xl"
                  />
                ) : (
                  <div className="flex h-[280px] w-[280px] items-center justify-center rounded-2xl bg-secondary">
                    <QrCode size={64} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-full bg-blush px-4 py-2">
                <Wifi size={16} className="text-accent" />
                <span className="text-xs font-semibold text-foreground">
                  {th.sessionInfo(transactionId ? String(transactionId) : null)}
                </span>
              </div>

              <p className="mt-2 text-xs font-semibold text-destructive/80">
                เพื่อความสะดวก กรุณาไม่ปิดหน้านี้ จนกว่าจะจัดการสั่งซื้อเสร็จค่ะ
              </p>

              {(error || connectionError) && (
                <p className="max-w-md text-sm font-semibold text-destructive">
                  {error ?? connectionError}
                </p>
              )}
            </div>

            <div className="flex flex-col justify-center gap-5 p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  {th.mobileSessionTitle}
                </p>
                <h2 className="mt-2 font-display text-3xl text-foreground">
                  {th.waitingCustomer}
                </h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  {th.mobileSessionDesc}
                </p>
              </div>

              <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {th.sessionStatus}
                </p>
                <div className="mt-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-soft)]">
                  <p className="text-sm font-bold text-foreground">
                    {transactionId ? th.transaction(transactionId) : th.creatingLink}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {paymentStatus ? th.lastEvent(paymentStatus) : th.noMobileAction}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
