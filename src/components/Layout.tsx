import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Scan", to: "/scan" },
  { label: "Report", to: "/report" },
  { label: "Track", to: "/track" },
  { label: "Learn", to: "/learn" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Shield className="h-5 w-5 text-primary-light" />
            </div>
            <div>
              <span className="font-bold tracking-tight">CyberShield</span>
              <span className="ml-2 hidden text-xs text-text-muted sm:inline">
                Phishing &amp; Fraud Detector
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/15 text-primary-light"
                      : "text-text-muted hover:bg-card/50 hover:text-text"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            className="rounded-lg p-2 text-text-muted hover:bg-card/50 sm:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="border-t border-border bg-bg px-4 py-3 sm:hidden">
            {NAV_LINKS.map((link) => {
              const active =
                link.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/15 text-primary-light"
                      : "text-text-muted hover:bg-card/50 hover:text-text"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary-light" />
                <span className="font-semibold">CyberShield</span>
              </div>
              <p className="mt-2 text-xs text-text-muted">
                A phishing and cyber fraud detection tool built for India. Scan, report, and stay protected.
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Tools</h4>
              <ul className="space-y-1.5">
                {NAV_LINKS.slice(1).map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-xs text-text-muted hover:text-text">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Emergency</h4>
              <p className="text-xs text-text-muted">
                National Cyber Crime Helpline:{" "}
                <a href="tel:1930" className="font-medium text-danger">1930</a>
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Report at{" "}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-light"
                >
                  cybercrime.gov.in
                </a>
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-center text-xs text-text-muted/70">
              CyberShield provides heuristic risk assessment for educational purposes. It is not a
              substitute for official law enforcement. For incidents involving financial loss,
              always contact 1930 and cybercrime.gov.in.
            </p>
            <p className="mt-2 text-center text-xs text-text-muted/50">
              © 2026 CyberShield · Stay Vigilant · Stay Safe
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
