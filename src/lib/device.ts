const MACHINE_ID_KEY = "kiosk_machine_id";
const KIOSK_SECRET_KEY = "kiosk_secret";

export function getMachineId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(MACHINE_ID_KEY);
}

export function setMachineId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MACHINE_ID_KEY, id);
}

export function getKioskSecret(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KIOSK_SECRET_KEY);
}

export function setKioskSecret(secret: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KIOSK_SECRET_KEY, secret);
}

export function clearMachineId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MACHINE_ID_KEY);
  localStorage.removeItem(KIOSK_SECRET_KEY);
}
