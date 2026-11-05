import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2, AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react";
import { Card, Badge } from "./ui";
import { supabase } from "../lib/supabase";
import type { IncidentRecord } from "../lib/types";

export function TrackPage() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IncidentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async (codeToSearch: string) => {
    const trimmed = codeToSearch.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(false);
    try {
      const { data, error: queryError } = await supabase
        .from("incidents")
        .select(
          "id, reference_code, fraud_type, status, description, created_at, updated_at, admin_notes, reporter_name"
        )
        .eq("reference_code", trimmed)
        .maybeSingle();

      if (queryError) throw queryError;
      if (data) {
        setResult(data as IncidentRecord);
      } else {
        setError("No incident found with that reference code. Double-check the code and try again.");
      }
    } catch {
      setError("Could not search. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    const initialCode = searchParams.get("code");
    if (initialCode) void search(initialCode);
  }, [searchParams]);

  const statusVariant = (status: string) => {
    if (status === "resolved") return "safe" as const;
    if (status === "under_review") return "suspicious" as const;
    return "neutral" as const;
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Track Your Report</h1>
      <p className="mb-6 text-sm text-text-muted">
        Enter your reference code to check the status of your incident report.
      </p>

      <Card className="mb-6 p-5">
        <div className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CS-2026-50AF0B"
            className="flex-1 rounded-lg border border-border bg-bg/50 px-4 py-2.5 font-mono-cyber text-sm text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            onKeyDown={(e) => {
              if (e.key === "Enter") void search(code);
            }}
          />
          <button
            onClick={() => void search(code)}
            disabled={loading || !code.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition-all hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            Search
          </button>
        </div>
      </Card>

      {error && (
        <Card className="mb-6 flex items-start gap-3 border-danger/30 bg-danger/5 p-4 fade-in">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          <p className="text-sm text-danger">{error}</p>
        </Card>
      )}

      {result && (
        <Card className="fade-in p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-light" />
                <h2 className="text-lg font-semibold">{result.reference_code}</h2>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Filed by {result.reporter_name} on{" "}
                {new Date(result.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Badge variant={statusVariant(result.status)} className="px-3 py-1">
              {result.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <dl className="space-y-3">
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-sm text-text-muted">Fraud Type</dt>
              <dd className="text-sm font-medium">
                {result.fraud_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </dd>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="flex items-center gap-1.5 text-sm text-text-muted">
                <Clock className="h-3.5 w-3.5" />
                Last Updated
              </dt>
              <dd className="text-sm font-medium">
                {new Date(result.updated_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-sm text-text-muted">Description</dt>
              <dd className="rounded-lg border border-border bg-bg/40 p-3 text-sm">{result.description}</dd>
            </div>
            {result.admin_notes && (
              <div>
                <dt className="mb-1 flex items-center gap-1.5 text-sm text-text-muted">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Admin Notes
                </dt>
                <dd className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  {result.admin_notes}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {searched && !result && !error && (
        <Card className="p-8 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-text-muted/40" />
          <p className="text-sm text-text-muted">Enter a reference code to search.</p>
        </Card>
      )}
    </div>
  );
}
