import { createContext, useContext } from "react";
import { usePaymentWebSocket } from "@/hooks/usePaymentWebSocket";

type WsValue = ReturnType<typeof usePaymentWebSocket>;
const WsContext = createContext<WsValue | null>(null);

export function WsProvider({ machineUuid, children }: { 
  machineUuid: string | null; 
  children: React.ReactNode 
}) {
  const ws = usePaymentWebSocket(machineUuid, null, Boolean(machineUuid));
  return <WsContext.Provider value={ws}>{children}</WsContext.Provider>;
}

export function useWs() {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWs must be used within WsProvider");
  return ctx;
}