import { useState, useCallback } from "react";
import { Link2, MessageSquare, Image, ScanLine, Loader2, AlertCircle } from "lucide-react";
import { Card } from "./ui";
import { ScanResultCard } from "./ScanResultCard";
import { ScanHistory } from "./ScanHistory";
import { analyzeThreat, type ScanResult, type ScanType } from "../lib/analyzer";
import { supabase } from "../lib/supabase";
import { getSessionId } from "../lib/session";
import { useScanHistory } from "../lib/useScanHistory";
import type { ScanRecord } from "../lib/types";

type TabId = ScanType;

const TABS: { id: TabId; label: string; icon: typeof Link2 }[] = [
  { id: "url", label: "URL", icon: Link2 },
  { id: "message", label: "Message", icon: MessageSquare },
  { id: "screenshot", label: "Screenshot", icon: Image },
];

const PLACEHOLDERS: Record<TabId, string> = {
  url: "https://sbi-yono-rewards-expiry.verify-login.click/claim",
  message:
    "Dear Customer, your Paytm KYC is pending. Your account will be suspended today. Click http://paytm-kyc-verify.xyz to complete now.",
  screenshot:
    "Paste any text extracted from your screenshot, or upload an image below.",
};

export function ScannerPage() {
  const [activeTab, setActiveTab] = useState<TabId>("url");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedScan, setSavedScan] = useState<{ id: string; created_at: string; screenshot_name: string | null } | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [selectedHistoryScan, setSelectedHistoryScan] = useState<ScanRecord | null>(null);

  const { scans, loading, reload } = useScanHistory();

  const handleScan = useCallback(async () => {
    if (!input.trim() && activeTab !== "screenshot") return;
    setScanning(true);
    setSaveError(null);
    setResult(null);
    setSavedScan(null);

    await new Promise((r) => setTimeout(r, 600));

    const analysis = analyzeThreat(activeTab, input);
    setResult(analysis);

    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from("scans")
        .insert({
          session_id: sessionId,
          scan_type: activeTab,
          input_text: input.slice(0, 5000) || null,
          risk_score: analysis.riskScore,
          risk_level: analysis.riskLevel,
          threat_flags: analysis.threatFlags.map((f) => f.label),
          advice: analysis.advice,
          screenshot_name: activeTab === "screenshot" ? screenshotName : null,
        })
        .select("id, created_at, screenshot_name")
        .single();

      if (error) throw error;
      if (data) {
        setSavedScan({
          id: data.id,
          created_at: data.created_at,
          screenshot_name: data.screenshot_name,
        });
      }
      void reload();
    } catch {
      setSaveError("Could not save scan result. Analysis is still shown below.");
    } finally {
      setScanning(false);
    }
  }, [input, activeTab, screenshotName, reload]);

  const handleSelectHistoryScan = useCallback((scan: ScanRecord) => {
    setSelectedHistoryScan(scan);
    setResult({
      riskScore: scan.risk_score,
      riskLevel: scan.risk_level as ScanResult["riskLevel"],
      threatFlags: (scan.threat_flags ?? []).map((label) => ({
        label,
        description: "",
        severity: "medium" as const,
      })),
      advice: scan.advice ?? "",
    });
    setSavedScan({
      id: scan.id,
      created_at: scan.created_at,
      screenshot_name: scan.screenshot_name,
    });
    setSaveError(null);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Scan a Threat</h1>
        <p className="mt-2 text-text-muted">
          Analyze URLs, SMS, emails, or screenshots for phishing and fraud — tuned for the Indian threat landscape.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Scanner + Result */}
        <div className="space-y-6 lg:col-span-2">
          {/* Scanner input card */}
          <Card className="scanline p-6">
            {/* Tabs */}
            <div className="mb-5 flex gap-2 rounded-lg border border-border bg-bg/50 p-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setInput("");
                      setScreenshotName(null);
                    }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-text-muted hover:text-text hover:bg-card/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            {activeTab === "screenshot" ? (
              <div className="space-y-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={PLACEHOLDERS[activeTab]}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-bg/50 p-3 font-mono-cyber text-sm text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <Image className="mx-auto mb-2 h-8 w-8 text-text-muted/50" />
                  <label className="cursor-pointer text-sm text-primary-light hover:underline">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setScreenshotName(file.name);
                          setInput((prev) => prev || `Screenshot: ${file.name}`);
                        }
                      }}
                    />
                    Upload screenshot
                  </label>
                  {screenshotName && (
                    <p className="mt-2 text-xs text-text-muted">{screenshotName}</p>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={PLACEHOLDERS[activeTab]}
                rows={activeTab === "url" ? 2 : 5}
                className="w-full resize-none rounded-lg border border-border bg-bg/50 p-3 font-mono-cyber text-sm text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    void handleScan();
                  }
                }}
              />
            )}

            {/* Scan button */}
            <button
              onClick={() => void handleScan()}
              disabled={scanning || (!input.trim() && activeTab !== "screenshot")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-white transition-all hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <ScanLine className="h-5 w-5" />
                  Scan Now
                </>
              )}
            </button>
          </Card>

          {/* Save error */}
          {saveError && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 fade-in">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-sm text-warning">{saveError}</p>
            </div>
          )}

          {/* Scan result */}
          {result && savedScan && (
            <ScanResultCard
              result={result}
              scanType={activeTab}
              inputText={input}
              scanId={savedScan.id}
              scannedAt={savedScan.created_at}
              screenshotName={savedScan.screenshot_name}
            />
          )}

          {/* History-selected scan result */}
          {result && !savedScan && selectedHistoryScan && (
            <ScanResultCard
              result={result}
              scanType={selectedHistoryScan.scan_type as ScanType}
              inputText={selectedHistoryScan.input_text ?? ""}
              scanId={selectedHistoryScan.id}
              scannedAt={selectedHistoryScan.created_at}
              screenshotName={selectedHistoryScan.screenshot_name}
            />
          )}
        </div>

        {/* Right: Scan history */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ScanHistory
              scans={scans}
              loading={loading}
              onReload={() => void reload()}
              onSelectScan={handleSelectHistoryScan}
              selectedId={selectedHistoryScan?.id ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
