import { useEffect, useMemo, useRef, useState } from "react";
import { XCircle } from "lucide-react";
import { HeroBanner } from "./HeroBanner";
import { FloatingDecorations } from "./FloatingDecorations";
import { ProductGrid } from "./ProductGrid";
import { ProductDetailModal } from "./ProductDetailModal";
import { QrPaymentModal } from "./QrPaymentModal";
import { MobileOrderModal } from "./MobileOrderModal";
import { RegisterKioskPage } from "./RegisterKioskPage";
import { products as fallbackProducts, type Product } from "@/data/products";
import { useMachineSlots } from "@/hooks/useMachineSlots";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";
import { getKioskSecret, getMachineId } from "@/lib/device";
import { slotsToKioskProducts } from "@/lib/slots";
import { kioskLogin } from "@/lib/api/client";
import type { CheckoutResult } from "@/types/kiosk";
import { th } from "@/i18n/th";
import { WsProvider, useWs } from "./WsContext";

const envMachineUuid = import.meta.env.VITE_MACHINE_UUID?.trim() || null;

export function HomePage() {
  const [registeredMachineUuid] = useState(() => getMachineId());
  const [storedKioskSecret] = useState(() => getKioskSecret());
  const [authState, setAuthState] = useState<"checking" | "ready" | "register">("checking");
  const [authError, setAuthError] = useState<string | null>(null);

  const machineUuid = envMachineUuid ?? registeredMachineUuid;
  const activeMachineUuid = authState === "ready" ? machineUuid : null;

  useEffect(() => {
    let cancelled = false;

    async function login() {
      if (!machineUuid || !storedKioskSecret) {
        setAuthState("register");
        return;
      }

      try {
        setAuthError(null);
        await kioskLogin(machineUuid, storedKioskSecret);
        if (!cancelled) setAuthState("ready");
      } catch (err) {
        if (!cancelled) {
          setAuthError(err instanceof Error ? err.message : th.loginFailed);
          setAuthState("register");
        }
      }
    }

    void login();
    return () => {
      cancelled = true;
    };
  }, [machineUuid, storedKioskSecret]);

  if (authState === "checking") {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-background text-lg font-bold text-foreground">
        {th.checkingRegistration}
      </main>
    );
  }

  if (authState === "register") {
    return (
      <RegisterKioskPage
        machineUuid={machineUuid}
        onSuccess={() => window.location.reload()}
      />
    );
  }

  return (
    <WsProvider machineUuid={activeMachineUuid}>
      <HomePageInner
        machineUuid={machineUuid}
        activeMachineUuid={activeMachineUuid}
        authError={authError}
      />
    </WsProvider>
  );
}

type InnerProps = {
  machineUuid: string | null;
  activeMachineUuid: string | null;
  authError: string | null;
};

function HomePageInner({ machineUuid, activeMachineUuid, authError }: InnerProps) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const handledWsMessageRef = useRef<unknown>(null);

  const slots = useMachineSlots(activeMachineUuid);
  const pay = usePaymentFlow(activeMachineUuid);
  const globalWs = useWs(); // ✅ อยู่ใน WsProvider แล้ว

  const products = useMemo<Product[]>(() => {
    if (!slots.data?.slots.length) return fallbackProducts;
    return slotsToKioskProducts(slots.data.slots);
  }, [slots.data]);

  const isMachineUnavailable =
    slots.data != null &&
    (slots.data.machine.status !== "ACTIVE" || !slots.data.machine.is_online);

  useEffect(() => {
    if (!globalWs.lastMessage) return;
    const msg = globalWs.lastMessage;
    if (handledWsMessageRef.current === msg) return;

    if (msg.type === "SHOW_KIOSK_QR") {
      if (msg.slot_number && msg.transaction_id) {
        const product = products.find((p) => Number(p.slotNumber) === Number(msg.slot_number));
        if (product) {
          handledWsMessageRef.current = msg;
          const fakeCheckout: CheckoutResult = {
            transaction_id: msg.transaction_id,
            amount: msg.amount || product.price,
            session_id: msg.session_id ?? null,
            currency: "THB",
            payment_status: "pending",
            promptpay: null,
            payment_intent_id: undefined,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.imageUrl,
            },
          };
          setMobileOpen(false);
          pay.startFromCheckout(product, fakeCheckout);
        }
      }
    } else if (globalWs.paymentStatus === "SWITCH_TO_KIOSK") {
      if (msg.slot_number && msg.transaction_id) {
        const product = products.find((p) => Number(p.slotNumber) === Number(msg.slot_number));
        if (product) {
          handledWsMessageRef.current = msg;
          const fakeCheckout: CheckoutResult = {
            transaction_id: msg.transaction_id,
            amount: msg.amount || product.price,
            session_id: msg.session_id,
            currency: "THB",
            payment_status: "pending",
            promptpay: msg.promptpay || null,
            payment_intent_id: msg.payment_intent_id || undefined,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.imageUrl,
            },
          };
          setMobileOpen(false);
          pay.startFromCheckout(product, fakeCheckout);
        }
      }
    } else if (globalWs.paymentStatus === "SUCCEEDED" && globalWs.lastMessage) {
      if (handledWsMessageRef.current === globalWs.lastMessage) return;
      if (pay.state !== "success" && pay.state !== "complete") {
        handledWsMessageRef.current = globalWs.lastMessage;

        if (!pay.product && msg.slot_number) {
          const product = products.find((p) => Number(p.slotNumber) === Number(msg.slot_number));
          if (product) {
            const fakeCheckout: CheckoutResult = {
              transaction_id: msg.transaction_id,
              amount: msg.amount || product.price,
              session_id: msg.session_id,
              currency: "THB",
              payment_status: "succeeded",
              promptpay: msg.promptpay || null,
              payment_intent_id: msg.payment_intent_id || undefined,
              product: {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.imageUrl,
              },
            };
            pay.showSuccess(product, fakeCheckout);
          } else {
            pay.simulatePaid();
          }
        } else {
          pay.simulatePaid();
        }

        setMobileOpen(false);
      }
    } else if (globalWs.paymentStatus === "CANCELLED" && globalWs.lastMessage) {
      if (pay.product && pay.state === "waiting") {
        handledWsMessageRef.current = globalWs.lastMessage;
        pay.cancel();
      }
    } else if (globalWs.paymentStatus === "KIOSK_SWITCH_CANCELLED" && globalWs.lastMessage) {
      if (pay.product && pay.state === "waiting") {
        handledWsMessageRef.current = globalWs.lastMessage;
      }
    }
  }, [globalWs.paymentStatus, globalWs.lastMessage, products, pay]);

  const mobileProduct = products.find((p) => p.available) ?? null;

  return (
    <main className="relative flex h-screen w-screen max-w-[100vw] flex-col overflow-hidden">
      <FloatingDecorations />
      <HeroBanner onMobileOrder={() => setMobileOpen(true)} />
      <ProductGrid products={products} onSelect={setSelected} />

      <footer className="kiosk-safe-bottom shrink-0 px-6 pb-4 pt-2 text-center text-xs font-medium text-muted-foreground">
        {authError
          ? th.registrationStatus(authError)
          : slots.error
            ? th.syncStockFailed(slots.error)
            : th.tapToView}
        {" · "}
        {machineUuid ? th.machineReady : th.machineNotSelected}
      </footer>

      <ProductDetailModal
        product={selected}
        onClose={() => setSelected(null)}
        onBuy={(p) => {
          setSelected(null);
          void pay.start(p);
        }}
      />

      <MobileOrderModal
        open={mobileOpen}
        machineUuid={machineUuid}
        product={mobileProduct}
        products={products}
        onClose={() => setMobileOpen(false)}
        onPayAtKiosk={(product, checkout) => {
          setMobileOpen(false);
          pay.startFromCheckout(product, checkout);
        }}
        onMobilePaid={(product, checkout) => {
          setMobileOpen(false);
          if (pay.checkout?.transaction_id !== checkout.transaction_id) {
            pay.startFromCheckout(product, checkout);
            pay.simulatePaid();
          }
        }}
      />

      <QrPaymentModal
        product={pay.product}
        checkout={pay.checkout}
        state={pay.state}
        starting={pay.starting}
        error={pay.error}
        connectionError={pay.connectionError}
        onClose={() => {
              pay.reset(); // 🆕 clear product/checkout ออก ทำให้ modal ปิด
          setMobileOpen(false);
        }}
        onCancel={pay.cancel}
        onRefresh={pay.refresh}
      />

      {isMachineUnavailable && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="mx-8 w-full max-w-lg rounded-3xl border-2 border-secondary bg-card px-12 py-14 text-center shadow-card">
            <div className="mx-auto grid size-28 place-items-center rounded-full bg-destructive/10 text-destructive">
              <XCircle size={64} strokeWidth={1.5} />
            </div>
            <h2 className="mt-8 font-display text-4xl font-bold text-foreground">
              ขออภัย
            </h2>
            <p className="mt-4 text-xl font-semibold text-foreground/70 leading-relaxed">
              ขณะนี้ตู้อยู่ในสถานะ
              <br />
              ไม่พร้อมให้บริการ
            </p>
            <div className="mt-6 h-px bg-secondary" />
            <p className="mt-6 text-base font-medium text-foreground/40">
              กรุณารอสักครู่ ระบบกำลังตรวจสอบ...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
