export interface ScanRecord {
  id: string;
  session_id: string;
  scan_type: string;
  input_text: string | null;
  risk_score: number;
  risk_level: string;
  threat_flags: string[];
  advice: string | null;
  screenshot_name: string | null;
  created_at: string;
}

export interface IncidentRecord {
  id: string;
  reference_code: string;
  fraud_type: string;
  status: string;
  description: string;
  reporter_name: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}
