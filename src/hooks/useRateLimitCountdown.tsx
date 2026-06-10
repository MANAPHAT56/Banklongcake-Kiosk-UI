import { useEffect, useRef, useState } from "react";

export function useRateLimitCountdown(open: boolean, cooldownSeconds: number) {
  const [remaining, setRemaining] = useState(cooldownSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!open) {
      setRemaining(cooldownSeconds);
      return;
    }

    setRemaining(cooldownSeconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, cooldownSeconds]);

  const progress = cooldownSeconds > 0 ? remaining / cooldownSeconds : 0;

  return { remaining, progress };
}