import { useEffect, useRef, useState } from "react";
import { fetchTransactionState, getPaymentWebSocketUrl } from "@/lib/api/client";
import { th } from "@/i18n/th";

const TERMINAL_STATUSES = new Set(["SUCCEEDED", "FAILED", "CANCELLED", "INVALIDATED"]);

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

    // Pull recovery state on start or reconnect
    if (transactionId) {
      fetchTransactionState(transactionId)
        .then((res) => {
          if (closed) return;
          const state = res.state;
          if (state) {
            // Update local status based on current authoritative state if it indicates a terminal or handled state
            if (state.paymentChannel === 'kiosk' && state.checkoutOwner === 'kiosk') {
               setPaymentStatus("SWITCH_TO_KIOSK");
            } else if (state.status === "SUCCEEDED" || state.status === "FAILED") {
               setPaymentStatus(state.status);
            }
          }
        })
        .catch(() => {
          // Silent catch, let WS handle real time
        });
    }

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

      const isTargetTransaction = !transactionId || message.transaction_id === transactionId;

      if (
        (message.type === "mobile.switch_to_kiosk" ||
          message.type === "CHECKOUT_TRANSFERRED_TO_KIOSK" ||
          message.type === "SHOW_KIOSK_QR") &&
        isTargetTransaction
      ) {
        setPaymentStatus("SWITCH_TO_KIOSK");
        setConnectionError(null);
        return;
      }

      if ((message.type === "KIOSK_SWITCH_CANCELLED" || message.type === "CART_UPDATED") && isTargetTransaction) {
        setPaymentStatus("CANCELLED");
        setConnectionError(null);
        return;
      }

      if (message.type === "SESSION_INVALIDATED" && isTargetTransaction) {
        setPaymentStatus("INVALIDATED");
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
  }, [transactionId, enabled, machineUuid]);

  return { paymentStatus, connectionError, lastMessage };
}
