import type { ScanResult, ScanType } from "./analyzer";
import { jsPDF } from "jspdf";

export function exportScanAsPdf(params: {
  scanType: ScanType;
  inputText: string;
  result: ScanResult;
  scanId?: string;
  scannedAt?: string;
}): void {
  const { scanType, inputText, result, scanId, scannedAt } = params;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const colorSafe: [number, number, number] = [16, 185, 129];
  const colorSuspicious: [number, number, number] = [245, 158, 11];
  const colorDanger: [number, number, number] = [239, 68, 68];
  const colorPrimary: [number, number, number] = [37, 99, 235];
  const colorDark: [number, number, number] = [30, 41, 59];
  const colorMuted: [number, number, number] = [100, 116, 139];

  const riskColor =
    result.riskLevel === "safe" ? colorSafe : result.riskLevel === "suspicious" ? colorSuspicious : colorDanger;

  // Header bar
  doc.setFillColor(...colorDark);
  doc.rect(0, 0, pageWidth, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CyberShield", margin, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("Phishing & Fraud Detection Report", margin, 54);
  doc.setFontSize(8);
  doc.text("cybershield.app", pageWidth - margin, 36, { align: "right" });

  y = 110;

  // Report meta
  doc.setTextColor(...colorMuted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (scanId) {
    doc.text(`Report ID: ${scanId}`, margin, y);
    y += 14;
  }
  doc.text(
    `Generated: ${scannedAt ?? new Date().toISOString()}`,
    margin,
    y
  );
  y += 14;
  doc.text(`Scan Type: ${scanType.toUpperCase()}`, margin, y);
  y += 24;

  // Risk level badge
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...riskColor);
  const levelLabel = result.riskLevel.toUpperCase();
  doc.text(`Risk Level: ${levelLabel}`, margin, y);
  y += 18;

  // Risk score
  doc.setFontSize(11);
  doc.setTextColor(...colorDark);
  doc.text(`Risk Score: ${result.riskScore} / 100`, margin, y);
  y += 22;

  // Score bar
  const barWidth = maxWidth;
  const barHeight = 8;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(margin, y, barWidth, barHeight, 4, 4, "F");
  doc.setFillColor(...riskColor);
  const fillWidth = Math.max(barHeight, (barWidth * result.riskScore) / 100);
  doc.roundedRect(margin, y, fillWidth, barHeight, 4, 4, "F");
  y += barHeight + 24;

  // Input content
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colorDark);
  doc.text("Scanned Content", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colorMuted);
  const inputLines = doc.splitTextToSize(
    inputText.slice(0, 2000) || "(no text content)",
    maxWidth
  );
  doc.text(inputLines, margin, y, { lineHeightFactor: 1.5 });
  y += inputLines.length * 14 + 20;

  // Threat flags
  if (y > 680) {
    doc.addPage();
    y = margin;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colorDark);
  doc.text(`Threat Flags (${result.threatFlags.length})`, margin, y);
  y += 18;

  if (result.threatFlags.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...colorSafe);
    doc.text("No specific threats detected.", margin, y);
    y += 20;
  } else {
    for (const flag of result.threatFlags) {
      if (y > 720) {
        doc.addPage();
        y = margin;
      }
      const sevColor =
        flag.severity === "high" ? colorDanger : flag.severity === "medium" ? colorSuspicious : colorSafe;
      doc.setFillColor(...sevColor);
      doc.circle(margin + 4, y - 3, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...colorDark);
      doc.text(flag.label, margin + 16, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colorMuted);
      const descLines = doc.splitTextToSize(flag.description, maxWidth - 16);
      doc.text(descLines, margin + 16, y, { lineHeightFactor: 1.4 });
      y += descLines.length * 12 + 12;
    }
  }

  y += 8;
  if (y > 680) {
    doc.addPage();
    y = margin;
  }

  // Advice
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colorPrimary);
  doc.text("Safety Advice", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...colorDark);
  const adviceLines = doc.splitTextToSize(result.advice, maxWidth);
  doc.text(adviceLines, margin, y, { lineHeightFactor: 1.5 });
  y += adviceLines.length * 15 + 20;

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...colorMuted);
    doc.setFont("helvetica", "normal");
    doc.text(
      "CyberShield provides heuristic risk assessment for educational purposes.",
      margin,
      doc.internal.pageSize.getHeight() - 24
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 24,
      { align: "right" }
    );
  }

  const filename = `cybershield-report-${scanId?.slice(0, 8) ?? Date.now()}.pdf`;
  doc.save(filename);
}
