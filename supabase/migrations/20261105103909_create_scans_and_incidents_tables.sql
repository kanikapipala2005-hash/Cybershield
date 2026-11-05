/*
# Create scans and incidents tables for CyberShield

## Purpose
CyberShield is a no-auth phishing/fraud scanner. Visitors scan URLs, messages,
or screenshots; each scan result is saved to the `scans` table. Visitors can
also report fraud incidents (saved to `incidents`) and later track them by
reference code. There is no sign-in screen — the app identifies a visitor's
recent scans via a client-generated `session_id` stored in localStorage.

## 1. New Tables

### scans
Stores the result of each scan performed on the /scan page.
- id            uuid PK, auto-generated
- session_id    uuid, NOT NULL — client localStorage session identifier
- scan_type     text — "url" | "message" | "screenshot"
- input_text    text, nullable — the scanned content (max 5000 chars enforced by app)
- risk_score    int — 0-100 heuristic risk score
- risk_level    text — "safe" | "suspicious" | "dangerous"
- threat_flags  jsonb — array of threat label strings
- advice        text — safety guidance shown to user
- screenshot_name text, nullable — filename when scan_type is "screenshot"
- created_at    timestamptz, default now()

### incidents
Stores fraud reports submitted on the /report page and tracked on /track.
- id              uuid PK, auto-generated
- reporter_name   text, NOT NULL
- reporter_contact text, NOT NULL
- fraud_type      text, NOT NULL
- scammer_phone   text, nullable
- scammer_upi_id  text, nullable
- transaction_id  text, nullable
- amount_lost     numeric, default 0
- description     text, NOT NULL
- incident_date   date, NOT NULL
- reference_code  text, UNIQUE, auto-generated (format CS-YYYY-XXXXXX)
- status          text, default 'pending'
- admin_notes     text, nullable
- created_at      timestamptz, default now()
- updated_at      timestamptz, default now()

## 2. Indexes
- scans(session_id, created_at DESC) — home page lists a session's recent scans
- incidents(reference_code) — track page looks up by reference code

## 3. Security (RLS + Grants)
This is a single-tenant no-auth app: the browser uses the anon key with no
sign-in. All policies target `anon, authenticated` so the anon-key client can
read and write. Data is intentionally public/shared (scan history keyed by
client session_id; incidents lookups by reference code).
- RLS enabled on both tables.
- GRANT SELECT, INSERT on scans TO anon, authenticated.
- GRANT SELECT, INSERT, UPDATE on incidents TO anon, authenticated
  (UPDATE for future status/admin_notes changes).
- Four CRUD policies per table with USING/WITH CHECK (true) — acceptable
  because the data is intentionally public in this no-auth app.

## 4. Reference code generation
A trigger generates a unique reference_code (CS-YYYY-XXXXXX) on insert so the
/report page can return it immediately via .select("reference_code").single().
*/

-- ========== scans table ==========
CREATE TABLE IF NOT EXISTS scans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL,
  scan_type       text NOT NULL,
  input_text      text,
  risk_score      int NOT NULL DEFAULT 0,
  risk_level      text NOT NULL,
  threat_flags    jsonb NOT NULL DEFAULT '[]'::jsonb,
  advice          text,
  screenshot_name text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scans_session_created
  ON scans (session_id, created_at DESC);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON scans TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_scans" ON scans;
CREATE POLICY "anon_select_scans" ON scans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scans" ON scans;
CREATE POLICY "anon_insert_scans" ON scans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scans" ON scans;
CREATE POLICY "anon_update_scans" ON scans FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scans" ON scans;
CREATE POLICY "anon_delete_scans" ON scans FOR DELETE
  TO anon, authenticated USING (true);

-- ========== incidents table ==========
CREATE TABLE IF NOT EXISTS incidents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name    text NOT NULL,
  reporter_contact text NOT NULL,
  fraud_type       text NOT NULL,
  scammer_phone    text,
  scammer_upi_id   text,
  transaction_id   text,
  amount_lost      numeric NOT NULL DEFAULT 0,
  description      text NOT NULL,
  incident_date    date NOT NULL,
  reference_code   text UNIQUE,
  status           text NOT NULL DEFAULT 'pending',
  admin_notes      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_reference_code
  ON incidents (reference_code);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON incidents TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_incidents" ON incidents;
CREATE POLICY "anon_select_incidents" ON incidents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_incidents" ON incidents;
CREATE POLICY "anon_insert_incidents" ON incidents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_incidents" ON incidents;
CREATE POLICY "anon_update_incidents" ON incidents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_incidents" ON incidents;
CREATE POLICY "anon_delete_incidents" ON incidents FOR DELETE
  TO anon, authenticated USING (true);

-- ========== reference_code auto-generation ==========
CREATE OR REPLACE FUNCTION generate_reference_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  year_part text;
  rand_part text;
BEGIN
  year_part := to_char(now(), 'YYYY');
  rand_part := lpad(to_hex(floor(random() * 16777216)::int), 6, '0');
  code := 'CS-' || year_part || '-' || upper(rand_part);
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION set_incident_reference_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.reference_code IS NULL THEN
    NEW.reference_code := generate_reference_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_incident_reference_code ON incidents;
CREATE TRIGGER trg_incident_reference_code
  BEFORE INSERT ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION set_incident_reference_code();
