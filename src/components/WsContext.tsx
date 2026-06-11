import { createContext, useContext, useCallback, useRef, useState } from "react";
import { usePaymentWebSocket } from "@/hooks/usePaymentWebSocket";

type WsValue = ReturnType<typeof usePaymentWebSocket> & {
  resetPaymentStatus: () => void;
};

const WsContext = createContext<WsValue | null>(null);

export function WsProvider({
  machineUuid,
  children,
}: {
  machineUuid: string | null;
  children: React.ReactNode;
}) {
  const ws = usePaymentWebSocket(machineUuid, null, Boolean(machineUuid));

  const [overrideStatus, setOverrideStatus] = useState<string | null | undefined>(undefined);

  const prevRawStatus = useRef(ws.paymentStatus);
  if (ws.paymentStatus !== prevRawStatus.current) {
    prevRawStatus.current = ws.paymentStatus;
    if (overrideStatus !== undefined) {
      setOverrideStatus(undefined);
    }
  }

  const resetPaymentStatus = useCallback(() => {
    setOverrideStatus(null);
  }, []);

  const value: WsValue = {
    ...ws,
    paymentStatus: overrideStatus !== undefined ? overrideStatus : ws.paymentStatus,
    resetPaymentStatus,
  };

  return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}

export function useWs() {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWs must be used within WsProvider");
  return ctx;
}