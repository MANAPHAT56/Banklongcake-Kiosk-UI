import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTransactionState, getPaymentWebSocketUrl } from "@/lib/api/client";
import { th } from "@/i18n/th";

const TERMINAL_STATUSES = new Set(["SUCCEEDED", "FAILED", "CANCELLED", "INVALIDATED", "KIOSK_SWITCH_CANCELLED"]);

function normalizePaymentStatus(status: string | null | undefined) {
  if (!status) return null;
  const normalized = status.toUpperCase();

  if (normalized === "SUCCEEDED" || normalized === "SUCCESS" || normalized === "PAID") {
    return "SUCCEEDED";
  }

  if (normalized === "FAILED" || normalized === "PAYMENT_FAILED") {
    return "FAILED";
  }

  if (normalized === "CANCELED") {
    return "CANCELLED";
  }

  return normalized;
}

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
  const versionOwnerRef = useRef<number | null>(null);

  const resetPaymentStatus = useCallback(() => {
    setPaymentStatus(null);
  }, []);

  useEffect(() => {
    if (!enabled || !machineUuid) {
      setPaymentStatus(null);
      setConnectionError(null);
      return undefined;
    }

    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectDelay = 2000;

    function connect() {
      if (closed) return;
      if (transactionId) {
        fetchTransactionState(transactionId)
          .then((res) => {
            if (closed) return;
            const state = res.state;
            if (state) {
              if (versionOwnerRef.current !== transactionId) {
                versionOwnerRef.current = transactionId;
                latestVersionRef.current = 0;
              }
              if (state.version && state.version <= latestVersionRef.current) return;
              if (state.version) latestVersionRef.current = state.version;

              const status = normalizePaymentStatus(state.status);

              if (state.paymentChannel === "kiosk" && state.status === "awaiting_payment") {
                setPaymentStatus("SWITCH_TO_KIOSK");
              } else if (status && TERMINAL_STATUSES.has(status)) {
                setPaymentStatus(status);
              }
            }
          })
          .catch(() => {});
      }
    }

    function startHeartbeat(ws: WebSocket) {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "ping" }));
        }
      }, 30000);
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
          })
        );
        startHeartbeat(ws);
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

        if (message.type === "pong") return;

        if (message.version != null) {
          const msgTxId = message.transaction_id ?? null;
          if (msgTxId !== null && versionOwnerRef.current !== msgTxId) {
            versionOwnerRef.current = msgTxId;
            latestVersionRef.current = 0;
          }
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
          setPaymentStatus("KIOSK_SWITCH_CANCELLED");
          setConnectionError(null);
          return;
        }

        if (message.type === "CART_UPDATED" && isTargetTransaction) {
          setPaymentStatus("CART_UPDATED");
          setConnectionError(null);
          return;
        }

        if (
          (message.type === "SESSION_INVALIDATED" || message.type === "PAYMENT_INVALIDATED") &&
          isTargetTransaction
        ) {
          setPaymentStatus("INVALIDATED");
          setConnectionError(null);
          return;
        }

        if (message.type === "MOBILE_PAYMENT_SUCCESS" && isTargetTransaction) {
          setPaymentStatus("SUCCEEDED");
          setConnectionError(null);
          ws.close();
          return;
        }

        if (message.type === "payment.updated" && isTargetTransaction) {
          const status = normalizePaymentStatus(message.payment_status);
          setPaymentStatus(status);
          setConnectionError(null);
          if (status && TERMINAL_STATUSES.has(status)) {
            ws.close();
          }
        }
      };

      ws.onerror = () => {
        if (!closed) setConnectionError(th.wsConnectFailed);
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
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
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [transactionId, enabled, machineUuid]);

  return { paymentStatus, connectionError, lastMessage, resetPaymentStatus };
}