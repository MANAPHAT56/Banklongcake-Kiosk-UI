import { useEffect, useRef, useState } from "react";
import {
  createRegistrationRequest,
  fetchRegistrationRequestStatus,
  kioskLogin,
} from "@/lib/api/client";
import { setKioskSecret, setMachineId } from "@/lib/device";

type RegistrationState = "idle" | "verifying" | "pending" | "success" | "rejected" | "error";

export function useDeviceRegistration(machineUuid: string | null) {
  const [state, setState] = useState<RegistrationState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<number | null>(null);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const completeApproved = async (approvedMachineUuid: string, kioskSecret: string, onSuccess: (machineId: string) => void) => {
    await kioskLogin(approvedMachineUuid, kioskSecret);
    setMachineId(approvedMachineUuid);
    setKioskSecret(kioskSecret);
    setState("success");
    onSuccess(approvedMachineUuid);
  };

  const pollStatus = (id: number, onSuccess: (machineId: string) => void) => {
    stopPolling();
    pollingRef.current = window.setInterval(async () => {
      try {
        const result = await fetchRegistrationRequestStatus(id);
        if (result.status === "APPROVED" && result.kiosk_secret) {
          stopPolling();
          await completeApproved(result.machine_uuid, result.kiosk_secret, onSuccess);
        }
        if (result.status === "REJECTED") {
          stopPolling();
          setState("rejected");
          setError("คำขอลงทะเบียนถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "ตรวจสอบสถานะคำขอไม่สำเร็จ");
      }
    }, 5000);
  };

  const register = async (code: string, onSuccess: (machineId: string) => void) => {
    setState("verifying");
    setError(null);

    try {
      if (!machineUuid) {
        throw new Error("ไม่พบรหัสตู้นี้");
      }
      if (!code.trim()) {
        throw new Error("กรุณากรอกรหัสลงทะเบียน");
      }

      const request = await createRegistrationRequest({
        machine_uuid: machineUuid,
        registration_code: code.trim(),
      });

      setRequestId(request.id);

      if (request.status === "APPROVED" && request.kiosk_secret) {
        await completeApproved(request.machine_uuid, request.kiosk_secret, onSuccess);
        return;
      }

      if (request.status === "REJECTED") {
        setState("rejected");
        setError("คำขอลงทะเบียนถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ");
        return;
      }

      setState("pending");
      pollStatus(request.id, onSuccess);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "การลงทะเบียนล้มเหลว");
    }
  };

  return { state, error, requestId, register };
}
