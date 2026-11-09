"use client";

import { createContext, useCallback, useContext, useState } from "react";
import Toast from "@/components/ui/Toast";

// One toast for the My Jobs page. Row actions use it, so a message like "Draft deleted"
// stays on screen after its row (or the whole table, for the last job) is removed.
const ShowToastContext = createContext(() => {});

export function useJobsToast() {
  return useContext(ShowToastContext);
}

export default function JobsToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <ShowToastContext.Provider value={setToast}>
      {children}
      <Toast toast={toast} onDismiss={dismissToast} />
    </ShowToastContext.Provider>
  );
}
