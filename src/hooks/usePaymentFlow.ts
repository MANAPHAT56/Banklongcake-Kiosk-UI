import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import type { PayState } from "@/components/QrPaymentModal";
import {
  createCheckout,
  cancelSessionKioskSwitch,
  fetchTransactionState,
  payCheckoutForKiosk,
} from "@/lib/api/client";
import type { CheckoutResult } from "@/types/kiosk";
import { th } from "@/i18n/th";
import { useWs } from "@/components/WsContext";

const PAYMENT_STATUS_POLL_MS = Math.max(
  1000,
  Number.parseInt(import.meta.env.VITE_PAYMENT_STATUS_POLL_MS ?? "3000", 10),
);

function isSameTransaction(messageTransactionId: unknown, checkoutTransactionId: number) {
  return Number(messageTransactionId) === Number(checkoutTransactionId);
}

function normalizePaymentStatus(status: string | null | undefined) {
  if (!status) return null;
  const normalized = status.toUpperCase();
  if (normalized === "SUCCEEDED" || normalized === "SUCCESS" || normalized === "PAID") return "SUCCEEDED";
  if (normalized === "FAILED" || normalized === "PAYMENT_FAILED") return "FAILED";
  if (normalized === "CANCELED") return "CANCELLED";
  return normalized;
}

export function usePaymentFlow(machineUuid: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [state, setState] = useState<PayState>("waiting");
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState(30);
  const requestRef = useRef(0);

  const { paymentStatus: rawStatus, connectionError, lastMessage } = useWs();
  const paymentStatus = !checkout?.transaction_id || isSameTransaction(lastMessage?.transaction_id, checkout.transaction_id)
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
    setRateLimited(false);
    setRateLimitRetryAfter(30);
  }, [checkout]);

  const start = useCallback(async (p: Product) => {
    const slotNumber = p.slotNumber ?? p.id;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setStarting(true);
    setError(null);
    setRateLimited(false);
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

      const isRateLimit =
        (err as { status?: number })?.status === 429 ||
        (err as { code?: string })?.code === "RATE_LIMIT_EXCEEDED";

      if (isRateLimit) {
        const retryAfter = (err as { retryAfter?: number })?.retryAfter ?? 30;
        setRateLimitRetryAfter(retryAfter);
        setRateLimited(true);
        // ไม่ปิด product — ให้ retry ได้หลัง countdown หมด
      } else {
        setProduct(null);
        setState("waiting");
        setError(err instanceof Error ? err.message : th.createPaymentFailed);
      }
    } finally {
      if (requestRef.current === requestId) {
        setStarting(false);
      }
    }
  }, [machineUuid]);

  const clearRateLimit = useCallback(() => {
    setRateLimited(false);
    setRateLimitRetryAfter(30);
  }, []);

  const startFromCheckout = useCallback(async (p: Product, result: CheckoutResult) => {
    requestRef.current += 1;
    const requestId = requestRef.current;

    setError(null);
    setRateLimited(false);
    setProduct(p);

    if (result.promptpay?.image_url_png || result.promptpay?.image_url_svg) {
      setStarting(false);
      setCheckout(result);
      setState("waiting");
      return;
    }

    setStarting(true);
    setCheckout(result);
    setState("waiting");

    try {
      const payResult = await payCheckoutForKiosk(result.transaction_id);
      if (requestRef.current !== requestId) return;

      setCheckout({
        ...result,
        ...payResult,
        product: payResult.product ?? result.product,
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
    setRateLimited(false);
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
        setCheckout((prev) => {
          if (!prev) return payResult;
          return {
            ...prev,
            ...payResult,
            product: payResult.product ?? prev.product,
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
      setRateLimited(false);
      setRateLimitRetryAfter(30);
    }
  }, [paymentStatus, cancel]);

  useEffect(() => {
    if (!checkout?.transaction_id || state !== "waiting") return;

    let stopped = false;
    const transactionId = checkout.transaction_id;

    const syncTransactionState = async () => {
      try {
        const result = await fetchTransactionState(transactionId);
        if (stopped) return;

        const status = normalizePaymentStatus(result.state?.status ?? result.state?.payment_status);

        if (status === "SUCCEEDED") {
          setState("success");
          setError(null);
          return;
        }

        if (status === "FAILED" || status === "CANCELLED") {
          setError(th.paymentNotCompleted);
          cancel();
          return;
        }

        if (status === "KIOSK_SWITCH_CANCELLED") {
          requestRef.current += 1;
          setProduct(null);
          setCheckout(null);
          setState("waiting");
          setError(null);
          setStarting(false);
          setRateLimited(false);
          setRateLimitRetryAfter(30);
        }
      } catch {
        // WebSocket remains the primary path; polling is only recovery when WS misses an event.
      }
    };

    void syncTransactionState();
    const interval = window.setInterval(syncTransactionState, PAYMENT_STATUS_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void syncTransactionState();
      }
    };

    window.addEventListener("focus", syncTransactionState);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", syncTransactionState);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkout?.transaction_id, state, cancel]);

  useEffect(() => {
    if (!product || state !== "success") return;
    const timer = window.setTimeout(() => cancel(), 10000);
    return () => window.clearTimeout(timer);
  }, [state, product, cancel]);

  const reset = useCallback(() => {
    requestRef.current += 1;
    setProduct(null);
    setCheckout(null);
    setState("waiting");
    setError(null);
    setStarting(false);
    setRateLimited(false);
    setRateLimitRetryAfter(30);
  }, []);

  return {
    product,
    state,
    checkout,
    starting,
    error,
    rateLimited,
    rateLimitRetryAfter,
    connectionError,
    start,
    reset,
    clearRateLimit,
    startFromCheckout,
    cancel,
    refresh,
    simulatePaid,
    showSuccess,
  };
}