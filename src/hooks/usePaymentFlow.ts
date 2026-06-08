import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import type { PayState } from "@/components/QrPaymentModal";
import { createCheckout, cancelSessionKioskSwitch } from "@/lib/api/client";
import type { CheckoutResult } from "@/types/kiosk";
import { usePaymentWebSocket } from "./usePaymentWebSocket";
import { th } from "@/i18n/th";

export function usePaymentFlow(machineUuid: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [state, setState] = useState<PayState>("waiting");
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);
  const { paymentStatus, connectionError } = usePaymentWebSocket(
    machineUuid,
    checkout?.transaction_id,
    Boolean(machineUuid && product && state === "waiting"),
  );

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

  const startFromCheckout = useCallback((p: Product, result: CheckoutResult) => {
    requestRef.current += 1;
    setError(null);
    setStarting(false);
    setProduct(p);
    setCheckout(result);
    setState("waiting");
  }, []);

  const simulatePaid = useCallback(() => setState("success"), []);
  const refresh = useCallback(() => {
    if (product) {
      void start(product);
    }
  }, [product, start]);

  useEffect(() => {
    if (paymentStatus === "SUCCEEDED") {
      setState("success");
    }

    if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      setError(th.paymentNotCompleted);
      cancel();
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
  };
}
