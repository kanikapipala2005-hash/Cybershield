import { ShieldCheck, ShieldAlert, Phone, Lock, Eye, KeySquare, MessageSquareWarning } from "lucide-react";
import { Card } from "./ui";

const GUIDES = [
  {
    icon: KeySquare,
    title: "Never Share OTPs or PINs",
    description: "No bank, payment app, or government agency will ever ask for your OTP, UPI PIN, or password over phone, SMS, or email. If someone does, it is a scam.",
    tips: ["Never read out an OTP to anyone", "Never enter your UPI PIN on links", "Banks never ask for credentials by phone"],
  },
  {
    icon: Eye,
    title: "Verify URLs Before Clicking",
    description: "Phishing links mimic real sites with slight spelling changes. Always check the domain carefully before entering any personal information.",
    tips: ["Look for HTTPS and correct spelling", "Don't click shortened links from unknown senders", "Type known URLs directly instead of clicking"],
  },
  {
    icon: MessageSquareWarning,
    title: "Beware Urgency Tactics",
    description: "Scammers create false urgency — 'account will be suspended today' — to pressure you into acting before thinking. Slow down and verify.",
    tips: ["Legitimate services give time to respond", "Call official numbers to verify", "Don't act under pressure"],
  },
  {
    icon: Lock,
    title: "Secure Your Accounts",
    description: "Enable two-factor authentication on all important accounts. Use unique, strong passwords for banking and payment apps.",
    tips: ["Enable 2FA wherever available", "Use a password manager", "Review account activity regularly"],
  },
];

export function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Learn to Protect Yourself</h1>
      <p className="mb-8 text-sm text-text-muted">
        Essential safety knowledge to recognize and avoid phishing and fraud attempts.
      </p>

      <div className="space-y-4">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          return (
            <Card key={guide.title} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Icon className="h-5.5 w-5.5 text-primary-light" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{guide.title}</h3>
                  <p className="mt-1.5 text-sm text-text-muted">{guide.description}</p>
                  <ul className="mt-3 space-y-1.5">
                    {guide.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 flex flex-col items-center gap-3 border-danger/30 bg-danger/5 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-danger" />
          <div>
            <h3 className="font-semibold text-danger">Already a Victim?</h3>
            <p className="text-sm text-text-muted">Report within the golden hour for the best chance of recovery.</p>
          </div>
        </div>
        <a
          href="tel:1930"
          className="flex items-center gap-2 rounded-lg bg-danger px-5 py-2.5 font-bold text-white transition-all hover:bg-danger/80 active:scale-95"
        >
          <Phone className="h-4.5 w-4.5" />
          Call 1930
        </a>
      </Card>
    </div>
  );
}
