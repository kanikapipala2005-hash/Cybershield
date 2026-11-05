import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, ShieldX, TrendingUp, ArrowRight, ScanLine, FileText, Search, BookOpen, Phone } from "lucide-react";
import { Card, Badge } from "./ui";
import { supabase } from "../lib/supabase";
import { getSessionId } from "../lib/session";

interface Stats {
  totalScans: number;
  safeCount: number;
  suspiciousCount: number;
  dangerousCount: number;
  incidentCount: number;
}

const SCAM_PATTERNS_DISPLAY = [
  { title: "SBI YONO Reward Points Expiry", type: "sms", weight: 28 },
  { title: "Paytm KYC Verification Scam", type: "sms", weight: 30 },
  { title: "Fake Electricity Bill Disconnection", type: "sms", weight: 26 },
  { title: "WhatsApp Part-Time Job Scam", type: "whatsapp", weight: 27 },
  { title: "Fraudulent UPI Handle Lookalike", type: "upi", weight: 24 },
];

export function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentScans, setRecentScans] = useState<
    { id: string; scan_type: string; risk_level: string; created_at: string }[]
  >([]);

  useEffect(() => {
    void (async () => {
      try {
        const sessionId = getSessionId();
        const [scansRes, incidentsRes] = await Promise.all([
          supabase
            .from("scans")
            .select("id, scan_type, risk_level, created_at")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase.from("incidents").select("id", { count: "exact", head: true }),
        ]);

        const scansData = scansRes.data ?? [];
        setRecentScans(scansData.slice(0, 5));
        setStats({
          totalScans: scansData.length,
          safeCount: scansData.filter((s) => s.risk_level === "safe").length,
          suspiciousCount: scansData.filter((s) => s.risk_level === "suspicious").length,
          dangerousCount: scansData.filter((s) => s.risk_level === "dangerous").length,
          incidentCount: incidentsRes.count ?? 0,
        });
      } catch {
        setStats({ totalScans: 0, safeCount: 0, suspiciousCount: 0, dangerousCount: 0, incidentCount: 0 });
      }
    })();
  }, []);

  const quickActions = [
    { icon: ScanLine, label: "Scan a Threat", desc: "URL, message, or screenshot", to: "/scan" },
    { icon: FileText, label: "Report an Incident", desc: "Submit evidence securely", to: "/report" },
    { icon: Search, label: "Track Your Report", desc: "Check incident status", to: "/track" },
    { icon: BookOpen, label: "Learn to Protect", desc: "Safety guides & modules", to: "/learn" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-light">
          <ShieldCheck className="h-4 w-4" />
          Indian Phishing &amp; Fraud Detector
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Detect. Report. Defend.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-text-muted">
          Scan suspicious links, SMS, emails, and screenshots for phishing and cyber fraud —
          tuned for the Indian threat landscape. From SBI YONO reward scams to Paytm KYC fraud
          and UPI lookalikes.
        </p>
        <Link
          to="/scan"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 active:scale-95"
        >
          <ScanLine className="h-5 w-5" />
          Start Scanning
        </Link>
      </section>

      {/* Stats */}
      <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{stats ? "—" : "—"}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-text-muted">Scans Performed</p>
        </Card>
        <Card className="p-4 text-center">
          <ShieldCheck className="mx-auto mb-1 h-5 w-5 text-success" />
          <p className="text-2xl font-bold text-success">{stats?.safeCount ?? "—"}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-text-muted">Marked Safe</p>
        </Card>
        <Card className="p-4 text-center">
          <ShieldAlert className="mx-auto mb-1 h-5 w-5 text-warning" />
          <p className="text-2xl font-bold text-warning">
            {(stats?.suspiciousCount ?? 0) + (stats?.dangerousCount ?? 0) || "—"}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-text-muted">Suspicious / Dangerous</p>
        </Card>
        <Card className="p-4 text-center">
          <FileText className="mx-auto mb-1 h-5 w-5 text-primary-light" />
          <p className="text-2xl font-bold">{stats?.incidentCount ?? "—"}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-text-muted">Community Reports</p>
        </Card>
      </section>

      {/* Recent scan activity */}
      {recentScans.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Recent Scan Activity</h2>
          <Card className="divide-y divide-border">
            {recentScans.map((scan) => {
              const Icon = scan.risk_level === "safe" ? ShieldCheck : scan.risk_level === "suspicious" ? ShieldAlert : ShieldX;
              const color = scan.risk_level === "safe" ? "text-success" : scan.risk_level === "suspicious" ? "text-warning" : "text-danger";
              return (
                <div key={scan.id} className="flex items-center gap-3 p-3">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm">{scan.scan_type.toUpperCase()}</span>
                  <Badge variant={scan.risk_level as "safe" | "suspicious" | "dangerous"} className="ml-auto px-2 py-0 text-[10px]">
                    {scan.risk_level}
                  </Badge>
                  <span className="text-xs text-text-muted">
                    {new Date(scan.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              );
            })}
          </Card>
        </section>
      )}

      {/* Emerging scam patterns */}
      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5 text-warning" />
          Emerging Scam Patterns
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCAM_PATTERNS_DISPLAY.map((pattern) => (
            <Card key={pattern.title} className="p-4">
              <p className="text-sm font-medium">{pattern.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="neutral" className="px-2 py-0 text-[10px]">{pattern.type}</Badge>
                <span className="text-xs text-text-muted">weight {pattern.weight}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.to}
                className="group rounded-xl border border-border bg-card/60 p-5 transition-all hover:border-primary/40 hover:bg-card hover:shadow-lg"
              >
                <Icon className="mb-3 h-6 w-6 text-primary-light" />
                <p className="font-semibold">{action.label}</p>
                <p className="mt-1 text-xs text-text-muted">{action.desc}</p>
                <ArrowRight className="mt-3 h-4 w-4 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary-light" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Emergency */}
      <section className="mb-4">
        <Card className="flex flex-col items-center gap-4 border-danger/30 bg-danger/5 p-6 sm:flex-row sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-danger">
              <Phone className="h-5 w-5" />
              Emergency Contacts
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              For incidents involving financial loss, call the National Cyber Crime Helpline.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:1930"
              className="rounded-lg bg-danger px-4 py-2 font-bold text-white transition-all hover:bg-danger/80 active:scale-95"
            >
              Call 1930
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-danger/40 px-4 py-2 font-medium text-danger transition-all hover:bg-danger/10"
            >
              cybercrime.gov.in
            </a>
          </div>
        </Card>
      </section>

      <p className="text-center text-xs text-text-muted/70">
        CyberShield provides heuristic risk assessment for educational purposes. It is not a
        substitute for official law enforcement. For incidents involving financial loss, always
        contact 1930 and cybercrime.gov.in.
      </p>
    </div>
  );
}
