import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { Card } from "./ui";
import { supabase } from "../lib/supabase";

interface FormData {
  reporter_name: string;
  reporter_contact: string;
  fraud_type: string;
  scammer_phone: string;
  scammer_upi_id: string;
  transaction_id: string;
  amount_lost: string;
  description: string;
  incident_date: string;
}

const FRAUD_TYPES = [
  "upi_fraud",
  "phishing_link",
  "kyc_scam",
  "fake_job",
  "investment_scam",
  "delivery_scam",
  "impersonation",
  "other",
];

export function ReportPage() {
  const [form, setForm] = useState<FormData>({
    reporter_name: "",
    reporter_contact: "",
    fraud_type: "",
    scammer_phone: "",
    scammer_upi_id: "",
    transaction_id: "",
    amount_lost: "",
    description: "",
    incident_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reporter_name || !form.reporter_contact || !form.fraud_type || !form.description) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("incidents")
        .insert({
          reporter_name: form.reporter_name,
          reporter_contact: form.reporter_contact,
          fraud_type: form.fraud_type,
          scammer_phone: form.scammer_phone || null,
          scammer_upi_id: form.scammer_upi_id || null,
          transaction_id: form.transaction_id || null,
          amount_lost: form.amount_lost ? parseFloat(form.amount_lost) : 0,
          description: form.description,
          incident_date: form.incident_date,
        })
        .select("reference_code")
        .single();

      if (insertError) throw insertError;
      if (data) setReferenceCode(data.reference_code);
    } catch {
      setError("Failed to submit report. Please try again or call 1930.");
    } finally {
      setSubmitting(false);
    }
  };

  if (referenceCode) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="p-8 text-center fade-in">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
          <h2 className="text-2xl font-bold">Incident Reported Successfully</h2>
          <p className="mt-2 text-text-muted">
            Save your reference code to track this report later.
          </p>
          <div className="my-6 rounded-lg border border-primary/30 bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-wider text-text-muted">Your Reference Code</p>
            <p className="mt-1 font-mono-cyber text-2xl font-bold text-primary-light">
              {referenceCode}
            </p>
          </div>
          <a
            href="/track"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-light"
          >
            Track This Report
          </a>
        </Card>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-bg/50 px-3 py-2.5 text-sm text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Report an Incident</h1>
      <p className="mb-6 text-sm text-text-muted">
        Submit details about a fraud or phishing attempt. You'll receive a reference code to track your report.
      </p>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Your Name *</label>
              <input
                type="text"
                value={form.reporter_name}
                onChange={(e) => set("reporter_name", e.target.value)}
                className={inputClass}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contact Number *</label>
              <input
                type="tel"
                value={form.reporter_contact}
                onChange={(e) => set("reporter_contact", e.target.value)}
                className={inputClass}
                placeholder="Phone or email"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Fraud Type *</label>
            <select
              value={form.fraud_type}
              onChange={(e) => set("fraud_type", e.target.value)}
              className={inputClass}
            >
              <option value="">Select type…</option>
              {FRAUD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Scammer Phone</label>
              <input
                type="tel"
                value={form.scammer_phone}
                onChange={(e) => set("scammer_phone", e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Scammer UPI ID</label>
              <input
                type="text"
                value={form.scammer_upi_id}
                onChange={(e) => set("scammer_upi_id", e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Transaction ID</label>
              <input
                type="text"
                value={form.transaction_id}
                onChange={(e) => set("transaction_id", e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Amount Lost (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount_lost}
                onChange={(e) => set("amount_lost", e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Incident Date *</label>
              <input
                type="date"
                value={form.incident_date}
                onChange={(e) => set("incident_date", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="Describe what happened in detail…"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-white transition-all hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Report
              </>
            )}
          </button>
        </form>
      </Card>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-text-muted">
        <Phone className="h-4 w-4 shrink-0 text-danger" />
        For financial loss, also call <strong className="text-danger">1930</strong> immediately.
      </div>
    </div>
  );
}
