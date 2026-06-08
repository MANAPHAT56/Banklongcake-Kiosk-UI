import { useEffect, useRef, useState } from "react";
import { getPaymentWebSocketUrl } from "@/lib/api/client";
import { th } from "@/i18n/th";

const TERMINAL_STATUSES = new Set(["SUCCEEDED", "FAILED", "CANCELLED"]);

export function usePaymentWebSocket(
  machineUuid: string | null | undefined,
  transactionId: number | null | undefined,
  enabled: boolean
) {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !machineUuid) {
      setPaymentStatus(null);
      setConnectionError(null);
      return undefined;
    }

    let closed = false;
    const ws = new WebSocket(getPaymentWebSocketUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      if (closed) return;
      setConnectionError(null);
      ws.send(
        JSON.stringify({
          action: "subscribe",
          machine_uuid: machineUuid,
        }),
      );
    };

    ws.onmessage = (event) => {
      if (closed) return;

      let message: {
        type?: string;
        transaction_id?: number;
        payment_status?: string;
        message?: string;
      };

      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      setLastMessage(message);

      if (message.type === "error") {
        setConnectionError(message.message ?? th.wsError);
        return;
      }

      // If we are tracking a specific transaction, we should filter events for it,
      // EXCEPT when we don't have a transactionId yet (e.g., listening for external mobile payments).
      const isTargetTransaction = !transactionId || message.transaction_id === transactionId;

      if (!isTargetTransaction) {
         // Optionally handle cross-transaction logic, but for now ignore if it doesn't match our active local transaction
         // Actually, if it's a success, we might want to know even if it's not ours!
      }

      if (
        (message.type === "mobile.switch_to_kiosk" ||
          message.type === "CHECKOUT_TRANSFERRED_TO_KIOSK") &&
        isTargetTransaction
      ) {
        setPaymentStatus("SWITCH_TO_KIOSK");
        setConnectionError(null);
        return;
      }

      if (message.type === "KIOSK_SWITCH_CANCELLED" && isTargetTransaction) {
        setPaymentStatus("CANCELLED");
        setConnectionError(null);
        return;
      }

      if (message.type === "MOBILE_PAYMENT_SUCCESS" && isTargetTransaction) {
        setPaymentStatus("SUCCEEDED");
        setConnectionError(null);
        return;
      }

      if (message.type === "payment.updated" && isTargetTransaction) {
        setPaymentStatus(message.payment_status ?? null);
        setConnectionError(null);

        if (message.payment_status && TERMINAL_STATUSES.has(message.payment_status)) {
          ws.close();
        }
      }
    };

    ws.onerror = () => {
      if (!closed) {
        setConnectionError(th.wsConnectFailed);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      closed = true;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [transactionId, enabled]);

  return { paymentStatus, connectionError, lastMessage };
}
