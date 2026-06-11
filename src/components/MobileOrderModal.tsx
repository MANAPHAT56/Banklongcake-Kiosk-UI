import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Wifi, QrCode, Loader2, Clock } from "lucide-react"; // 🟢 เพิ่ม Clock icon
import type { Product } from "@/data/products";
import type { CheckoutResult } from "@/types/kiosk";
import { createMobileSession, cancelSessionKioskSwitch } from "@/lib/api/client";
import { useWs } from "./WsContext";
import { th } from "@/i18n/th";

type Props = {
  open: boolean;
  machineUuid: string | null;
  product: Product | null;
  products: Product[];
  onClose: () => void;
  onCancel: () => void;
  onPayAtKiosk: (product: Product, checkout: CheckoutResult) => void;
  onMobilePaid: (product: Product, checkout: CheckoutResult) => void;
};

function isSameTransaction(messageTransactionId: unknown, checkoutTransactionId: number) {
  return Number(messageTransactionId) === Number(checkoutTransactionId);
}

// 🟢 ฟังก์ชันช่วยจัดรูปแบบเวลาให้เป็น MM:SS
function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function MobileOrderModal({
  open,
  machineUuid,
  product,
  products,
  onClose,
  onCancel,
  onPayAtKiosk,
  onMobilePaid,
}: Props) {
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // 🟢 State เก็บเวลาที่เหลือ (วินาที)
  
  const handledStatusRef = useRef<string | null>(null);
  const hasRequestedRef = useRef<boolean>(false);
  const transactionId = checkout?.transaction_id;

  const { paymentStatus: rawStatus, connectionError, lastMessage } = useWs();
  const paymentStatus = !transactionId || isSameTransaction(lastMessage?.transaction_id, transactionId)
    ? rawStatus
    : null;

  // 🟢 ลอจิกจับเวลานับถอยหลัง อิงจาก expires_at ของ API
useEffect(() => {
    const expireTimeStr = checkout?.expires_at;

    // 💡 ปรับการเช็ก: นอกจากเช็กว่ามีค่าไหม ต้องเช็กว่าเป็น string ด้วย
    if (!open || typeof expireTimeStr !== 'string') {
      setTimeLeft(null);
      return;
    }

    const calculateRemaining = () => {
      // 💡 เพิ่มการตรวจสอบก่อนแปลงเป็น Date
      const targetDate = new Date(expireTimeStr);
      
      // ถ้าวันที่ไม่ถูกต้อง (Invalid Date) ให้รีเทิร์น 0 หรือจัดการตามเหมาะสม
      if (isNaN(targetDate.getTime())) {
        console.error("Invalid date format from API:", expireTimeStr);
        return 0;
      }

      const diffMs = targetDate.getTime() - Date.now();
      return Math.max(0, Math.floor(diffMs / 1000));
    };

    // ตั้งค่าเวลาเริ่มต้น
    setTimeLeft(calculateRemaining());

    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onClose(); 
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [open, checkout?.expires_at, onClose]);
  // ลอจิกตอนเปิด Modal เพื่อยิง API
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

  // ลอจิกจัดการ WebSocket Events
  useEffect(() => {
    if (!open || !product || !checkout || !paymentStatus) return;
    if (handledStatusRef.current === paymentStatus) return;

    if (paymentStatus === "SWITCH_TO_KIOSK") {
      handledStatusRef.current = paymentStatus;
      let finalProduct = product;
      if (lastMessage?.slot_number) {
        const updatedProduct = products.find(
          (p) => Number(p.slotNumber) === Number(lastMessage.slot_number)
        );
        if (updatedProduct) finalProduct = updatedProduct;
      }
      onPayAtKiosk(finalProduct, checkout);
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
  }, [checkout, onMobilePaid, onPayAtKiosk, open, paymentStatus, product, lastMessage, products]);

  const mobileUrl = checkout?.qr_url ?? "";
  const qrUrl = mobileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=10&data=${encodeURIComponent(mobileUrl)}&color=FF5C93&bgcolor=FFFFFF`
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
              onClick={() => {
                onClose();
              }}
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

              {/* 🟢 ส่วนแสดงเวลานับถอยหลังแทนคำว่า ใช้ได้ 24 ชั่วโมง */}
          <div className="flex items-center gap-3">
                {timeLeft !== null && (
                  <div className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${timeLeft <= 60 ? 'bg-destructive/10 text-destructive' : 'bg-blush text-accent'}`}>
                    <Clock size={16} />
                    <span className="text-sm font-bold">
                      ทำรายการภายในเว็บไซต์ภายใน: {formatCountdown(timeLeft)} นาที
                    </span>
                  </div>
                )}
                
              </div>

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