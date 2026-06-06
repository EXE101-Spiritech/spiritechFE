import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { checkServerHealth } from "@/shared/api/healthApi";
import { ServerDown } from "@/app/components/ServerDown";

interface HealthContextType {
  serverUp: boolean;
  checking: boolean;
  retry: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [serverUp, setServerUp] = useState(true); // optimistic: assume up
  const [checking, setChecking] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    const ok = await checkServerHealth();
    setServerUp(ok);
    setChecking(false);
    setRetrying(false);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const retry = useCallback(() => {
    setRetrying(true);
    check();
  }, [check]);

  // Don't block render while checking — show app immediately
  if (!serverUp && !checking) {
    return <ServerDown onRetry={retry} retrying={retrying} />;
  }

  return (
    <HealthContext.Provider value={{ serverUp, checking, retry }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth must be used within HealthProvider");
  return ctx;
}
