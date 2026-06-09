import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, ShoppingBag, X, Phone } from "lucide-react"; // 👈 เพิ่ม Phone เข้ามา
import { useEffect } from "react";
import type { Cake } from "@/types/cake";

const FACEBOOK_URL = import.meta.env.VITE_CONTACT_FACEBOOK_URL?.trim() || "";
const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE?.trim() || ""; // 👈 เปลี่ยนเป็นรับเบอร์โทรศัพท์

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function BuyAtKioskDialog({
  cake,
  open,
  onClose,
}: {
  cake: Cake | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && cake && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="วิธีซื้อที่ตู้"
        >
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-3xl w-full max-w-md shadow-bubble border-4 border-secondary overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-secondary/60">
              <h3 className="font-display font-bold text-lg">ซื้อที่หน้าตู้ บ้านกล่องเค้ก</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="ปิด"
                className="size-10 grid place-items-center rounded-full hover:bg-secondary text-foreground/60"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 sm:p-7 space-y-5">
              <div className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-4">
                <div className="size-12 rounded-2xl bg-gradient-pink text-primary-foreground grid place-items-center shrink-0">
                  <ShoppingBag className="size-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold truncate">{cake.name}</p>
                  <p className="text-accent font-bold text-lg">฿{cake.price}</p>
                </div>
              </div>

              <p className="text-center text-foreground/80 leading-relaxed">
                โปรด<strong className="text-foreground"> สแกนและชำระเงินที่หน้าตู้ </strong>
                บ้านกล่องเค้ก เท่านั้น
                <br />
                <span className="text-sm text-foreground/60">เว็บไซต์นี้ใช้ดูเมนูและรายละเอียดสินค้า</span>
              </p>

              <Link to="/locations" onClick={onClose} className="bubble-btn w-full justify-center">
                <MapPin className="size-4" />
                ค้นหาตู้ใกล้คุณ
              </Link>

              <div className="text-center space-y-3">
                <p className="text-sm font-bold text-foreground/70">ติดต่อผู้ขาย</p>
                <div className="flex justify-center gap-4">
                  
                  {FACEBOOK_URL ? (
                    <a
                      href={FACEBOOK_URL}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      className="size-14 rounded-2xl bg-[#1877F2] text-white grid place-items-center shadow-card hover:scale-105 transition-transform"
                    >
                      <FacebookIcon className="size-7" />
                    </a>
                  ) : null}

                  {/* 👈 เปลี่ยนจากปุ่ม LINE เป็นปุ่มโทรศัพท์ */}
                  {CONTACT_PHONE ? (
                    <a
                      href={`tel:${CONTACT_PHONE}`}
                      aria-label="โทรติดต่อผู้ขาย"
                      className="size-14 rounded-2xl bg-green-500 text-white grid place-items-center shadow-card hover:scale-105 transition-transform"
                    >
                      <Phone className="size-7" />
                    </a>
                  ) : null}

                  {/* 👈 เปลี่ยนข้อความแจ้งเตือนกรณีลืมตั้งค่า */}
                  {!FACEBOOK_URL && !CONTACT_PHONE ? (
                    <p className="text-xs text-foreground/50 flex items-center gap-1">
                      <MessageCircle className="size-4" />
                      ตั้งค่า VITE_CONTACT_FACEBOOK_URL / VITE_CONTACT_PHONE
                    </p>
                  ) : null}

                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}