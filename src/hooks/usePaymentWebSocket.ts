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
  const latestVersionRef = useRef(0);

  useEffect(() => {
    if (!enabled || !machineUuid) {
      setPaymentStatus(null);
      setConnectionError(null);
      return undefined;
    }

    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 2000;

    function connect() {
      if (closed) return;

      // Pull recovery state on start or reconnect
      if (transactionId) {
        fetchTransactionState(transactionId)
          .then((res) => {
            if (closed) return;
            const state = res.state;
            if (state) {
              if (state.version && state.version <= latestVersionRef.current) return;
              if (state.version) latestVersionRef.current = state.version;

              // Update local status based on current authoritative state if it indicates a terminal or handled state
              if (state.paymentChannel === 'kiosk' && state.status === 'awaiting_payment') {
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
    }

    function initWs() {
      if (closed) return;

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      connect();
      const ws = new WebSocket(getPaymentWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        if (closed) return;
        setConnectionError(null);
        ws.send(
          JSON.stringify({
            action: "subscribe",
            machine_uuid: machineUuid,
            transaction_id: transactionId,
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
          version?: number;
        };

        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }

        if (message.version != null) {
          if (message.version <= latestVersionRef.current) return;
          latestVersionRef.current = message.version;
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

        if (message.type === "KIOSK_SWITCH_CANCELLED" && isTargetTransaction) {
          setPaymentStatus("CANCELLED");
          setConnectionError(null);
          return;
        }

        if (message.type === "CART_UPDATED" && isTargetTransaction) {
          setPaymentStatus("CART_UPDATED");
          setConnectionError(null);
          return;
        }

        if ((message.type === "SESSION_INVALIDATED" || message.type === "PAYMENT_INVALIDATED") && isTargetTransaction) {
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
        if (!closed) {
          reconnectTimer = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 1.5, 10000);
            initWs();
          }, reconnectDelay);
        }
      };
    }

    initWs();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [transactionId, enabled, machineUuid]);

  return { paymentStatus, connectionError, lastMessage };
}