import { History, ShieldCheck, ShieldAlert, ShieldX, Clock, FileDown, RefreshCw } from "lucide-react";
import { Card, Badge } from "./ui";
import type { ScanRecord } from "../lib/types";
import type { ScanResult, ScanType } from "../lib/analyzer";
import { exportScanAsPdf } from "../lib/pdf-export";

interface ScanHistoryProps {
  scans: ScanRecord[];
  loading: boolean;
  onReload: () => void;
  onSelectScan: (scan: ScanRecord) => void;
  selectedId?: string | null;
}

function getRiskIcon(level: string) {
  if (level === "safe") return ShieldCheck;
  if (level === "suspicious") return ShieldAlert;
  return ShieldX;
}

function getRiskColor(level: string) {
  if (level === "safe") return "text-success";
  if (level === "suspicious") return "text-warning";
  return "text-danger";
}

function getRiskBg(level: string) {
  if (level === "safe") return "bg-success/15";
  if (level === "suspicious") return "bg-warning/15";
  return "bg-danger/15";
}

function reexportPdf(scan: ScanRecord) {
  const result: ScanResult = {
    riskScore: scan.risk_score,
    riskLevel: scan.risk_level as ScanResult["riskLevel"],
    threatFlags: (scan.threat_flags ?? []).map((label) => ({
      label,
      description: "",
      severity: "medium" as const,
    })),
    advice: scan.advice ?? "",
  };
  exportScanAsPdf({
    scanType: scan.scan_type as ScanType,
    inputText: scan.input_text ?? "",
    result,
    scanId: scan.id,
    scannedAt: scan.created_at,
  });
}

export function ScanHistory({
  scans,
  loading,
  onReload,
  onSelectScan,
  selectedId,
}: ScanHistoryProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <History className="h-4.5 w-4.5 text-primary-light" />
          Recent Scan History
        </h3>
        <button
          onClick={onReload}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-primary/40 hover:text-primary-light"
          aria-label="Refresh history"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-border bg-border/30"
            />
          ))}
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <History className="mb-3 h-8 w-8 text-text-muted/40" />
          <p className="text-sm text-text-muted">No scans yet.</p>
          <p className="mt-1 text-xs text-text-muted/70">
            Your recent scans will appear here after you run one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {scans.map((scan) => {
            const Icon = getRiskIcon(scan.risk_level);
            const color = getRiskColor(scan.risk_level);
            const bg = getRiskBg(scan.risk_level);
            const isSelected = scan.id === selectedId;
            return (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className={`group cursor-pointer rounded-lg border p-3 transition-all hover:border-primary/40 hover:bg-card/80 ${
                  isSelected ? "border-primary bg-primary/5" : "border-border bg-bg/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={scan.risk_level as "safe" | "suspicious" | "dangerous"}
                        className="px-2 py-0 text-[10px]"
                      >
                        {scan.risk_level}
                      </Badge>
                      <span className="text-xs text-text-muted">{scan.scan_type}</span>
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-text-muted/70">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-sm text-text-muted">
                      {scan.input_text
                        ? scan.input_text.slice(0, 80) + (scan.input_text.length > 80 ? "…" : "")
                        : scan.screenshot_name ?? "(no text)"}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-xs font-medium text-text-muted">
                        Score: <span className={color}>{scan.risk_score}</span>
                      </span>
                      <span className="text-xs text-text-muted">
                        {scan.threat_flags?.length ?? 0} flag{(scan.threat_flags?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          reexportPdf(scan);
                        }}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-text-muted opacity-0 transition-opacity hover:text-primary-light group-hover:opacity-100"
                        aria-label="Export this scan as PDF"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
