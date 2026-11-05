export type ScanType = "url" | "message" | "screenshot";
export type RiskLevel = "safe" | "suspicious" | "dangerous";

export interface ThreatFlag {
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface ScanResult {
  riskScore: number;
  riskLevel: RiskLevel;
  threatFlags: ThreatFlag[];
  advice: string;
}

interface ScamPattern {
  keywords: string[];
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
  weight: number;
}

const SCAM_PATTERNS: ScamPattern[] = [
  {
    keywords: ["yono", "reward", "points", "expiry", "expire", "claim", "sbi"],
    label: "SBI YONO Reward Points Expiry",
    description: "Fake SBI YONO reward expiry lure — a common phishing hook.",
    severity: "high",
    weight: 28,
  },
  {
    keywords: ["paytm", "kyc", "verify", "verification", "suspend", "pending"],
    label: "Paytm KYC Verification Scam",
    description: "Urgent Paytm KYC verification demand with suspension threat.",
    severity: "high",
    weight: 30,
  },
  {
    keywords: ["electricity", "bill", "disconnection", "disconnect", "power", "billdesk"],
    label: "Fake Electricity Bill Disconnection",
    description: "Threat of immediate power disconnection to induce panic payment.",
    severity: "high",
    weight: 26,
  },
  {
    keywords: ["part-time", "part time", "job", "whatsapp", "earning", "daily", "task"],
    label: "WhatsApp Part-Time Job Scam",
    description: "Fake part-time job offer spreading via WhatsApp for recruitment fraud.",
    severity: "high",
    weight: 27,
  },
  {
    keywords: ["upi", "payment", "send money", "refund", "gpay", "phonepe", "bhim"],
    label: "Fraudulent UPI Handle Lookalike",
    description: "Lookalike UPI ID designed to impersonate a legitimate handle.",
    severity: "medium",
    weight: 24,
  },
  {
    keywords: ["otp", "one time", "code", "verify your", "confirm your"],
    label: "OTP Harvesting Attempt",
    description: "Requests an OTP or verification code — never share these.",
    severity: "high",
    weight: 25,
  },
  {
    keywords: ["lottery", "winner", "won", "prize", "lucky draw", "congratulations"],
    label: "Fake Lottery / Prize Scam",
    description: "You've won a prize you never entered for — classic advance-fee fraud.",
    severity: "medium",
    weight: 20,
  },
  {
    keywords: ["delivery", "package", "courier", "customs", "shipment", "parcel"],
    label: "Fake Package Delivery Scam",
    description: "Phishing link disguised as a delivery or customs notice.",
    severity: "medium",
    weight: 18,
  },
  {
    keywords: ["loan", "approved", "instant", "no documents", "credit score"],
    label: "Fake Instant Loan Approval",
    description: "Unsolicited instant loan approval to collect processing fees.",
    severity: "medium",
    weight: 16,
  },
  {
    keywords: ["amazon", "flipkart", "order", "cancelled", "refund", "customer care"],
    label: "E-commerce Refund Impersonation",
    description: "Fake customer care agent offering a refund to steal credentials.",
    severity: "medium",
    weight: 19,
  },
];

const URL_INDICATORS = [
  { pattern: /\.xyz/i, label: "Suspicious TLD (.xyz)", weight: 12, severity: "medium" as const, description: "The .xyz TLD is frequently abused for phishing." },
  { pattern: /\.click/i, label: "Suspicious TLD (.click)", weight: 12, severity: "medium" as const, description: "The .click TLD is commonly used in phishing links." },
  { pattern: /\.top/i, label: "Suspicious TLD (.top)", weight: 10, severity: "low" as const, description: "The .top TLD is often associated with scam sites." },
  { pattern: /\.live/i, label: "Suspicious TLD (.live)", weight: 8, severity: "low" as const, description: "The .live TLD is sometimes used for fraudulent pages." },
  { pattern: /bit\.ly|tinyurl|t\.co|shorturl|cutt\.ly|goo\.gl/i, label: "URL Shortener Detected", weight: 15, severity: "medium" as const, description: "Shortened URLs hide the real destination — proceed with caution." },
  { pattern: /verify|login|secure|account|update|confirm/i, label: "Credential Harvesting Keywords in URL", weight: 18, severity: "high" as const, description: "URL contains keywords commonly used to steal login credentials." },
  { pattern: /-+.*(sbi|paytm|hdfc|icici|axis|bank|yono)/i, label: "Brand Impersonation in Domain", weight: 20, severity: "high" as const, description: "Domain uses hyphens to impersonate a known brand." },
  { pattern: /@[0-9]/, label: "IP/Embedded Credentials in URL", weight: 15, severity: "high" as const, description: "URL contains an @ symbol which can redirect to a different host." },
  { pattern: /\d{6,}/, label: "Long Numeric Sequence in Domain", weight: 10, severity: "medium" as const, description: "Domains with long numbers are often auto-generated phishing domains." },
];

const URGENCY_PHRASES = [
  "urgent", "immediately", "today", "now", "last chance", "expires",
  "suspend", "blocked", "deactivate", "within 24 hours", "act now",
  "final notice", "last warning", "your account will",
];

const ADVICE_MAP: Record<RiskLevel, string> = {
  safe: "No major threats detected. Continue with normal caution — never share OTPs, passwords, or UPI PINs with anyone.",
  suspicious: "Several warning signs detected. Do not click any links, do not share personal or financial information, and verify through official channels before proceeding.",
  dangerous: "High probability of phishing or fraud. Do NOT click any links or share any information. If you have already suffered financial loss, call the National Cyber Crime Helpline at 1930 immediately and file a report at cybercrime.gov.in.",
};

export function analyzeThreat(scanType: ScanType, input: string): ScanResult {
  const text = input.toLowerCase().trim();
  const flags: ThreatFlag[] = [];
  let score = 0;

  if (scanType === "url" || (scanType === "message" && /\bhttps?:\/\//i.test(input))) {
    for (const ind of URL_INDICATORS) {
      if (ind.pattern.test(input)) {
        flags.push({ label: ind.label, description: ind.description, severity: ind.severity });
        score += ind.weight;
      }
    }
  }

  for (const pattern of SCAM_PATTERNS) {
    const matched = pattern.keywords.filter((kw) => text.includes(kw));
    if (matched.length >= 2) {
      flags.push({
        label: pattern.label,
        description: pattern.description,
        severity: pattern.severity,
      });
      score += pattern.weight;
    }
  }

  const urgencyHits = URGENCY_PHRASES.filter((p) => text.includes(p));
  if (urgencyHits.length >= 2) {
    flags.push({
      label: "High-Urgency / Pressure Tactics",
      description: "Message creates false urgency to pressure immediate action — a hallmark of scams.",
      severity: "medium",
    });
    score += 15;
  }

  if (/\b\d{10}\b/.test(text)) {
    flags.push({
      label: "Phone Number Detected",
      description: "Message contains a 10-digit phone number — verify it independently before any contact.",
      severity: "low",
    });
    score += 5;
  }

  if (/upi|@ok|@ybl|@ibl|@axl/i.test(text) && scanType !== "url") {
    flags.push({
      label: "UPI ID Mentioned",
      description: "A UPI ID is present — never send money to an unverified handle.",
      severity: "medium",
    });
    score += 10;
  }

  score = Math.min(score, 100);

  let riskLevel: RiskLevel = "safe";
  if (score >= 60) riskLevel = "dangerous";
  else if (score >= 30) riskLevel = "suspicious";

  if (flags.length === 0 && score < 15) {
    riskLevel = "safe";
  }

  return {
    riskScore: score,
    riskLevel,
    threatFlags: flags,
    advice: ADVICE_MAP[riskLevel],
  };
}
