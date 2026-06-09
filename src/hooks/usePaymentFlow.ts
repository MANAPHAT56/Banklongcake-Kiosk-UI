import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import type { PayState } from "@/components/QrPaymentModal";
import { createCheckout, cancelSessionKioskSwitch, payCheckoutForKiosk } from "@/lib/api/client";
import type { CheckoutResult } from "@/types/kiosk";
import { usePaymentWebSocket } from "./usePaymentWebSocket";
import { th } from "@/i18n/th";
import { useWs } from "@/components/WsContext";
export function usePaymentFlow(machineUuid: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [state, setState] = useState<PayState>("waiting");
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);
const { paymentStatus: rawStatus, connectionError, lastMessage } = useWs();
const paymentStatus = !checkout?.transaction_id || lastMessage?.transaction_id === checkout.transaction_id
  ? rawStatus
  : null;

  const cancel = useCallback(() => {
    requestRef.current += 1;
    if (checkout?.session_id) {
      cancelSessionKioskSwitch(checkout.session_id).catch(() => {});
    }
    setProduct(null);
    setCheckout(null);
    setState("waiting");
    setError(null);
  }, [checkout]);

  const start = useCallback(async (p: Product) => {
    const slotNumber = p.slotNumber ?? p.id;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setStarting(true);
    setError(null);
    setProduct(p);
    setCheckout(null);
    setState("waiting");

    try {
      if (!machineUuid) {
        throw new Error(th.missingMachineUuid);
      }

      const result = await createCheckout(machineUuid, slotNumber);
      if (requestRef.current !== requestId) return;
      setCheckout(result);
    } catch (err) {
      if (requestRef.current !== requestId) return;
      setProduct(null);
      setState("waiting");
      setError(err instanceof Error ? err.message : th.createPaymentFailed);
    } finally {
      if (requestRef.current === requestId) {
        setStarting(false);
      }
    }
  }, [machineUuid]);

  const startFromCheckout = useCallback(async (p: Product, result: CheckoutResult) => {
    requestRef.current += 1;
    const requestId = requestRef.current;
    
    setError(null);
    setProduct(p);
    
    // If we already have promptpay (e.g. from standard createCheckout), just set it
    if (result.promptpay?.image_url_png || result.promptpay?.image_url_svg) {
      setStarting(false);
      setCheckout(result);
      setState("waiting");
      return;
    }

    // Otherwise we need to fetch the payment intent via kiosk
    setStarting(true);
    setCheckout(result);
    setState("waiting");
    
    try {
      const payResult = await payCheckoutForKiosk(result.transaction_id);
      if (requestRef.current !== requestId) return;
      
      // 💡 ป้องกันข้อมูลสินค้าเก่าโดนทับ
      setCheckout({ 
        ...result, 
        ...payResult,
        product: payResult.product ?? result.product 
      });
    } catch (err) {
      if (requestRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : th.createPaymentFailed);
    } finally {
      if (requestRef.current === requestId) {
        setStarting(false);
      }
    }
  }, []);

  const simulatePaid = useCallback(() => setState("success"), []);

  const showSuccess = useCallback((p: Product, result: CheckoutResult) => {
    requestRef.current += 1;
    setError(null);
    setProduct(p);
    setCheckout(result);
    setState("success");
    setStarting(false);
  }, []);

  const refresh = useCallback(async () => {
    if (!product) return;

    if (checkout?.transaction_id) {
      setStarting(true);
      setError(null);
      try {
        const payResult = await payCheckoutForKiosk(checkout.transaction_id);
        
        // 💡 ป้องกันคิวอาร์ใหม่ไปดึงข้อมูลสินค้าอื่นมาทับของเดิม
        setCheckout((prev) => {
          if (!prev) return payResult;
          return {
            ...prev,
            ...payResult,
            product: payResult.product ?? prev.product
          };
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : th.createPaymentFailed);
      } finally {
        setStarting(false);
      }
    } else {
      void start(product);
    }
  }, [product, checkout, start]);

useEffect(() => {
  if (paymentStatus === "SUCCEEDED") {
    setState("success");
  }

  if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
    setError(th.paymentNotCompleted);
    cancel();
  }

  if (paymentStatus === "KIOSK_SWITCH_CANCELLED") {
    requestRef.current += 1;
    setProduct(null);
    setCheckout(null);
    setState("waiting");
    setError(null);
    setStarting(false);
  }
}, [paymentStatus, cancel]);

  useEffect(() => {
    if (!product || state !== "success") return;
    const timer = window.setTimeout(() => cancel(), 10000);
    return () => window.clearTimeout(timer);
  }, [state, product, cancel]);

  return {
    product,
    state,
    checkout,
    starting,
    error,
    connectionError,
    start,
    startFromCheckout,
    cancel,
    refresh,
    simulatePaid,
    showSuccess,
  };
}