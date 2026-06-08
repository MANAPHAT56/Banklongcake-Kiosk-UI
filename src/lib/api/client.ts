import type {
  CheckoutResult,
  KioskLoginResult,
  MachineRegistrationCandidate,
  MachineSlotsResponse,
  MachinesListResponse,
  RegistrationRequestResult,
} from "@/types/kiosk";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function resolveHttpBase() {
  if (API_BASE) {
    return API_BASE.replace(/\/$/, "");
  }
  return typeof window !== "undefined" ? window.location.origin : "";
}

export function getPaymentWebSocketUrl() {
  const base = resolveHttpBase();
  if (base.startsWith("https://")) {
    return `${base.replace("https://", "wss://")}/api/payments/ws`;
  }
  if (base.startsWith("http://")) {
    return `${base.replace("http://", "ws://")}/api/payments/ws`;
  }
  const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = typeof window !== "undefined" ? window.location.host : "localhost";
  return `${protocol}//${host}/api/payments/ws`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${resolveHttpBase()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
    credentials: "include",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    const message = payload.error?.message ?? payload.message ?? `Request failed (${response.status})`;
    const error = new Error(message) as Error & { code?: string; status?: number };
    error.code = payload.error?.code;
    error.status = response.status;
    throw error;
  }

  return payload.data as T;
}

export function fetchMachineSlots(machineUuid: string) {
  return request<MachineSlotsResponse>(
    `/api/machines/${encodeURIComponent(machineUuid)}/slots`,
  );
}

export function createCheckout(machineUuid: string, slotNumber: number) {
  return request<CheckoutResult>("/api/checkout", {
    method: "POST",
    body: JSON.stringify({
      machine_uuid: machineUuid,
      slot_number: slotNumber,
    }),
  });
}

export function createMobileSession(machineUuid: string, slotNumber: number) {
  return request<CheckoutResult>("/api/mobile", {
    method: "POST",
    body: JSON.stringify({
      machine_uuid: machineUuid,
      slot_number: slotNumber,
    }),
  });
}

export function fetchTransactionState(transactionId: number) {
  return request<{ state: any }>(`/api/checkout/transactions/${encodeURIComponent(String(transactionId))}/state`);
}

export function payCheckoutForKiosk(transactionId: number) {
  return request<CheckoutResult>(`/api/checkout/transactions/${encodeURIComponent(String(transactionId))}/pay`, {
    method: "POST",
  });
}

export function searchUnregisteredMachines(search: string) {
  const query = new URLSearchParams({
    limit: "20",
    registration_status: "UNREGISTERED",
    sortBy: "name",
    sortOrder: "asc",
  });

  if (search.trim()) {
    query.set("search", search.trim());
  }

  return request<MachinesListResponse>(`/api/customer/machines?${query.toString()}`).then(
    (result) => (result.machines ?? result.data ?? []) as MachineRegistrationCandidate[],
  );
}

export function createRegistrationRequest(body: {
  machine_uuid: string;
  registration_code: string;
  machine_name?: string;
  location?: string;
  province?: string;
}) {
  return request<{ request: RegistrationRequestResult }>("/api/registration-requests", {
    method: "POST",
    body: JSON.stringify(body),
  }).then((result) => result.request);
}

export function fetchRegistrationRequestStatus(requestId: number) {
  return request<{ request: RegistrationRequestResult }>(
    `/api/registration-requests/${encodeURIComponent(String(requestId))}/status`,
  ).then((result) => result.request);
}

export function kioskLogin(machineUuid: string, kioskSecret: string) {
  return request<KioskLoginResult>("/api/kiosk-login", {
    method: "POST",
    body: JSON.stringify({
      machineUuid,
      kioskSecret,
    }),
  });
}

export function cancelSessionKioskSwitch(sessionId: string) {
  return request<{ success: boolean }>(`/api/mobile/sessions/${encodeURIComponent(sessionId)}/cancel`, {
    method: "POST",
  });
}