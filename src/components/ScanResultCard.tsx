import { FileDown, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, Badge, RiskMeter } from "./ui";
import type { ScanResult, ScanType } from "../lib/analyzer";
import { exportScanAsPdf } from "../lib/pdf-export";

interface ScanResultCardProps {
  result: ScanResult;
  scanType: ScanType;
  inputText: string;
  scanId?: string;
  scannedAt?: string;
  screenshotName?: string | null;
}

const severityIcon = {
  high: ShieldX,
  medium: ShieldAlert,
  low: ShieldCheck,
};

export function ScanResultCard({
  result,
  scanType,
  inputText,
  scanId,
  scannedAt,
  screenshotName,
}: ScanResultCardProps) {
  const levelIcon =
    result.riskLevel === "safe"
      ? ShieldCheck
      : result.riskLevel === "suspicious"
        ? ShieldAlert
        : ShieldX;

  const levelColor =
    result.riskLevel === "safe"
      ? "text-success"
      : result.riskLevel === "suspicious"
        ? "text-warning"
        : "text-danger";

  const LevelIcon = levelIcon;

  return (
    <Card className="fade-in overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${result.riskLevel === "safe" ? "bg-success/15" : result.riskLevel === "suspicious" ? "bg-warning/15" : "bg-danger/15"}`}>
            <LevelIcon className={`h-5 w-5 ${levelColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Scan Result</h3>
            <p className="text-xs text-text-muted">
              {scannedAt
                ? new Date(scannedAt).toLocaleString("en-IN")
                : "Just now"}{" "}
              · {scanType.toUpperCase()}
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            exportScanAsPdf({
              scanType,
              inputText,
              result,
              scanId,
              scannedAt,
            })
          }
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary-light transition-all hover:border-primary hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/10 active:scale-95"
        >
          <FileDown className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      <div className="space-y-6 p-5">
        {/* Risk score + badge */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <RiskMeter score={result.riskScore} level={result.riskLevel} />
          </div>
          <Badge
            variant={result.riskLevel as "safe" | "suspicious" | "dangerous"}
            className="px-4 py-1 text-sm"
          >
            <LevelIcon className="h-3.5 w-3.5" />
            {result.riskLevel.toUpperCase()}
          </Badge>
        </div>

        {/* Input content */}
        {inputText && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Scanned Content
            </h4>
            <div className="rounded-lg border border-border bg-bg/50 p-3">
              <p className="max-h-32 overflow-y-auto whitespace-pre-wrap break-all font-mono-cyber text-sm text-text-muted">
                {inputText.slice(0, 1000)}
                {inputText.length > 1000 && "…"}
              </p>
            </div>
          </div>
        )}

        {screenshotName && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Screenshot
            </h4>
            <p className="font-mono-cyber text-sm text-text-muted">{screenshotName}</p>
          </div>
        )}

        {/* Threat flags */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <AlertTriangle className="h-3.5 w-3.5" />
            Threat Flags ({result.threatFlags.length})
          </h4>
          {result.threatFlags.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <p className="text-sm text-success">No specific threats detected in this scan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {result.threatFlags.map((flag, i) => {
                const Icon = severityIcon[flag.severity];
                const sevColor =
                  flag.severity === "high"
                    ? "border-danger/30 bg-danger/5"
                    : flag.severity === "medium"
                      ? "border-warning/30 bg-warning/5"
                      : "border-success/30 bg-success/5";
                const sevText =
                  flag.severity === "high"
                    ? "text-danger"
                    : flag.severity === "medium"
                      ? "text-warning"
                      : "text-success";
                return (
                  <div
                    key={i}
                    className={`slide-in flex items-start gap-3 rounded-lg border p-3 ${sevColor}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${sevText}`} />
                    <div>
                      <p className="text-sm font-medium">{flag.label}</p>
                      <p className="text-xs text-text-muted">{flag.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Advice */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-light">
            <Lightbulb className="h-3.5 w-3.5" />
            Safety Advice
          </h4>
          <p className="text-sm leading-relaxed">{result.advice}</p>
        </div>
      </div>
    </Card>
  );
}
