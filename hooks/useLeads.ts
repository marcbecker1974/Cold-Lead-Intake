"use client";

import { useCallback, useEffect, useState } from "react";
import { loadLeads, saveLeads, type Lead } from "@/lib/storage";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // Load after mount so server and first client render match.
  useEffect(() => {
    // localStorage is an external system; reading it must wait until mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeads(loadLeads());
    setIsLoaded(true);
  }, []);

  // Persist on every change, but only once the stored data has been read.
  const update = useCallback((next: Lead[]) => {
    setLeads(next);
    setSaveFailed(!saveLeads(next));
  }, []);

  return { leads, isLoaded, saveFailed, setLeads: update };
}
