import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { getSessionId } from "./session";
import type { ScanRecord } from "./types";

export function useScanHistory() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = getSessionId();

  const loadScans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from("scans")
        .select(
          "id, session_id, scan_type, input_text, risk_score, risk_level, threat_flags, advice, screenshot_name, created_at"
        )
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (queryError) throw queryError;
      setScans(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scan history");
      setScans([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void loadScans();
  }, [loadScans]);

  return { scans, loading, error, reload: loadScans, sessionId };
}
