import { useCallback, useEffect, useState } from "react";
import { Delete, KeySquare, Loader2, MonitorSmartphone, Search, X } from "lucide-react";
import { useDeviceRegistration } from "../hooks/useDeviceRegistration";
import { FloatingDecorations } from "./FloatingDecorations";
import { searchUnregisteredMachines } from "@/lib/api/client";
import type { MachineRegistrationCandidate } from "@/types/kiosk";
import { th } from "@/i18n/th";
import mascot from "@/assets/mascot.png";

interface RegisterKioskPageProps {
  machineUuid: string | null;
  onSuccess: (machineId: string) => void;
}

const REGISTRATION_KEYS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".split("");
const REGISTRATION_KEY_SET = new Set(REGISTRATION_KEYS);

function normalizeRegistrationCode(value: string) {
  const raw = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  if (raw.length <= 4) return raw;
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

function machineUuidOf(machine: MachineRegistrationCandidate | null) {
  return machine?.machine_uuid ?? machine?.machineUuid ?? null;
}

export function RegisterKioskPage({ machineUuid, onSuccess }: RegisterKioskPageProps) {
  const [machineSearch, setMachineSearch] = useState("");
  const [machines, setMachines] = useState<MachineRegistrationCandidate[]>([]);
  const [machineLoading, setMachineLoading] = useState(false);
  const [machineError, setMachineError] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<MachineRegistrationCandidate | null>(
    machineUuid
      ? {
          machine_uuid: machineUuid,
          name: th.thisKiosk,
          location: th.storedMachineUuid,
        }
      : null,
  );
  const [code, setCode] = useState("");

  const selectedMachineUuid = machineUuidOf(selectedMachine);
  const { state, error, requestId, register } = useDeviceRegistration(selectedMachineUuid);
  const locked = state === "verifying" || state === "pending" || state === "success";
  const rawCode = code.replace(/[^A-Z0-9]/g, "");

  const appendKey = useCallback((key: string) => {
    if (locked) return;
    setCode((current) => normalizeRegistrationCode(`${current}${key}`));
  }, [locked]);

  const removeKey = useCallback(() => {
    if (locked) return;
    setCode((current) => normalizeRegistrationCode(current.replace(/[^A-Z0-9]/g, "").slice(0, -1)));
  }, [locked]);

  const clearCode = useCallback(() => {
    if (locked) return;
    setCode("");
  }, [locked]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMachineUuid || rawCode.length !== 8 || locked) return;
    void register(code, onSuccess);
  };

  useEffect(() => {
    if (selectedMachine) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setMachineLoading(true);
      setMachineError(null);

      try {
        const result = await searchUnregisteredMachines(machineSearch);
        if (!cancelled) {
          setMachines(result);
        }
      } catch (err) {
        if (!cancelled) {
          setMachineError(err instanceof Error ? err.message : th.searchMachinesFailed);
        }
      } finally {
        if (!cancelled) {
          setMachineLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [machineSearch, selectedMachine]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();

      if (!selectedMachine) {
        if (REGISTRATION_KEY_SET.has(key)) {
          event.preventDefault();
          setMachineSearch((current) => `${current}${key}`);
          return;
        }

        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          setMachineSearch((current) => current.slice(0, -1));
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          setMachineSearch("");
        }
        return;
      }

      if (locked) return;

      if (REGISTRATION_KEY_SET.has(key)) {
        event.preventDefault();
        appendKey(key);
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        removeKey();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        clearCode();
        return;
      }

      if (event.key === "Enter" && rawCode.length === 8) {
        event.preventDefault();
        void register(code, onSuccess);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appendKey, clearCode, code, locked, onSuccess, rawCode.length, register, removeKey, selectedMachine]);

  return (
    <main className="kiosk-safe-bottom relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background p-6">
      <FloatingDecorations />

      <div className="relative z-10 flex w-full max-w-[1100px] h-full max-h-[720px] rounded-[2.5rem] bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden">
        
        {/* LEFT COLUMN: Input & Keyboard */}
        <div className="w-[55%] flex flex-col p-10 border-r border-border bg-card overflow-y-auto">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MonitorSmartphone className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {th.registerTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{th.registerDesc}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-6 flex-1">
            {!selectedMachine ? (
              // Search Input & Keyboard
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">{th.machineSearchLabel}</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <div className="min-h-[60px] w-full rounded-xl border-2 border-primary/20 bg-background py-4 pl-12 pr-4 text-xl font-bold text-foreground shadow-sm">
                      {machineSearch || (
                        <span className="text-muted-foreground/50">{th.machineSearchPlaceholder}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2 rounded-2xl bg-secondary/50 p-4">
                  {REGISTRATION_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMachineSearch((current) => `${current}${key}`)}
                      className="flex h-12 sm:h-14 items-center justify-center rounded-xl bg-card text-lg sm:text-xl font-black text-foreground shadow-sm transition active:scale-95 hover:bg-secondary/80"
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={!machineSearch}
                    onClick={() => setMachineSearch((current) => current.slice(0, -1))}
                    className="col-span-3 flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-card text-sm font-bold text-foreground shadow-sm transition active:scale-95 disabled:opacity-40 hover:bg-secondary/80"
                  >
                    <Delete className="h-5 w-5" />
                    {th.delete}
                  </button>
                  <button
                    type="button"
                    disabled={!machineSearch}
                    onClick={() => setMachineSearch("")}
                    className="col-span-3 flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-card text-sm font-bold text-destructive shadow-sm transition active:scale-95 disabled:opacity-40 hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" />
                    {th.clear}
                  </button>
                </div>
              </div>
            ) : (
              // Registration Code Input & Keyboard
              <div className="flex flex-col gap-4 flex-1">
                {error && (
                  <div className="rounded-xl bg-destructive/10 p-4 text-center text-sm font-semibold text-destructive">
                    {error}
                  </div>
                )}

                {state === "pending" && (
                  <div className="rounded-xl bg-primary/10 p-4 text-center text-sm font-semibold text-primary">
                    {th.registrationPending(requestId ? String(requestId) : null)}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">
                      {th.registrationCode}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMachine(null);
                        setCode("");
                      }}
                      disabled={locked || Boolean(machineUuid)}
                      className="text-sm font-bold text-primary underline disabled:opacity-50"
                    >
                      {th.changeMachine}
                    </button>
                  </div>
                  <div className="relative">
                    <KeySquare className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
                    <div
                      aria-label={th.registrationCode}
                      className="min-h-[70px] w-full rounded-xl border-2 border-primary/30 bg-background py-4 pl-12 pr-4 text-center text-3xl font-bold tracking-[0.3em] text-foreground shadow-sm"
                    >
                      {code || (
                        <span className="text-muted-foreground/40 text-xl tracking-normal">
                          {th.registrationCodePlaceholder}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2 rounded-2xl bg-secondary/50 p-4 mt-auto">
                  {REGISTRATION_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      disabled={locked || rawCode.length >= 8}
                      onClick={() => appendKey(key)}
                      className="flex h-12 sm:h-14 items-center justify-center rounded-xl bg-card text-lg sm:text-xl font-black text-foreground shadow-sm transition active:scale-95 disabled:opacity-40 hover:bg-secondary/80"
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={locked || !code}
                    onClick={removeKey}
                    className="col-span-3 flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-card text-sm font-bold text-foreground shadow-sm transition active:scale-95 disabled:opacity-40 hover:bg-secondary/80"
                  >
                    <Delete className="h-5 w-5" />
                    {th.delete}
                  </button>
                  <button
                    type="button"
                    disabled={locked || !code}
                    onClick={clearCode}
                    className="col-span-3 flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-card text-sm font-bold text-destructive shadow-sm transition active:scale-95 disabled:opacity-40 hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" />
                    {th.clear}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={rawCode.length !== 8 || locked}
                  className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                >
                  {state === "verifying" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {th.sendingRequest}
                    </>
                  ) : state === "success" ? (
                    th.registered
                  ) : state === "pending" ? (
                    th.waitingApproval
                  ) : (
                    th.submitRegistration
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT COLUMN: Machine List or Mascot */}
        <div className="w-[45%] bg-secondary/30 relative flex flex-col">
          {!selectedMachine ? (
            <div className="flex flex-col h-full p-8 pt-10">
              <h2 className="text-xl font-display font-bold text-foreground mb-6 pl-2">เลือกตู้ที่จะลงทะเบียน</h2>
              
              {(!machineSearch && machines.length === 0 && !machineLoading) ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <img src={mascot} alt="Mascot" className="w-56 h-56 object-contain opacity-90 drop-shadow-xl" />
                  <p className="mt-6 text-sm font-bold text-muted-foreground text-center bg-card px-6 py-3 rounded-full shadow-sm">
                    พิมพ์ชื่อหรือไอดีตู้ทางด้านซ้าย<br/>เพื่อเริ่มค้นหาตู้ในระบบ
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {machineLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                      <span className="text-sm font-bold">{th.searchingMachines}</span>
                    </div>
                  ) : machineError ? (
                    <div className="rounded-2xl bg-destructive/10 p-6 text-center text-sm font-bold text-destructive">
                      {machineError}
                    </div>
                  ) : machines.length === 0 ? (
                    <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
                      <p className="text-base font-bold text-muted-foreground">{th.noMachinesFound}</p>
                    </div>
                  ) : (
                    machines.map((machine) => {
                      const uuid = machineUuidOf(machine);
                      return (
                        <button
                          key={uuid}
                          type="button"
                          onClick={() => {
                            setSelectedMachine(machine);
                            setCode("");
                          }}
                          className="w-full rounded-2xl bg-card p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:bg-accent/5 active:scale-[0.98] border border-transparent hover:border-accent/30 flex flex-col gap-1"
                        >
                          <p className="font-bold text-lg text-foreground">{machine.name}</p>
                          <p className="text-sm font-semibold text-muted-foreground">
                            {machine.location}
                          </p>
                          <p className="mt-2 inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground/80 w-fit">
                            {uuid}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
              <img src={mascot} alt="Mascot" className="w-64 h-64 object-contain drop-shadow-2xl z-10" />
              
              <div className="mt-8 rounded-3xl bg-card p-8 shadow-xl border-2 border-primary/20 w-full relative z-10">
                <p className="text-xs font-bold text-accent uppercase tracking-widest">ตู้ที่เลือก</p>
                <p className="mt-3 text-2xl font-display font-black text-foreground">{selectedMachine.name}</p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">{selectedMachine.location}</p>
                <div className="mt-4 bg-secondary/50 rounded-xl py-2 px-4">
                  <p className="text-xs font-mono font-bold text-muted-foreground">ID: {selectedMachineUuid}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
