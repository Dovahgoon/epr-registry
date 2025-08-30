-- == Tariff Schema (safe to run multiple times) ==
DO $$ BEGIN
  CREATE TYPE pack_stream AS ENUM ('household','commercial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "TariffScheme" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "countryId" uuid NOT NULL REFERENCES "Country"(id) ON DELETE CASCADE,
  "proId" uuid REFERENCES "Pro"(id) ON DELETE SET NULL,
  name text NOT NULL,
  stream pack_stream NOT NULL,
  "effectiveFrom" date NOT NULL,
  "effectiveTo" date,
  "sourceUrl" text,
  "lastVerifiedAt" timestamptz NOT NULL DEFAULT now(),
  notes text
);

CREATE INDEX IF NOT EXISTS tariffscheme_idx
  ON "TariffScheme"("countryId","proId",stream,"effectiveFrom");

CREATE TABLE IF NOT EXISTS "TariffRate" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "schemeId" uuid NOT NULL REFERENCES "TariffScheme"(id) ON DELETE CASCADE,
  material text NOT NULL,
  "packagingType" text,
  rate numeric(12,6) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'EUR',
  unit text NOT NULL DEFAULT 'per_kg',
  "thresholdMin" numeric,
  "thresholdMax" numeric,
  "thresholdUnit" text,
  "bonusMalus" jsonb,
  "sourceUrl" text,
  "lastVerifiedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE("schemeId", material, COALESCE("packagingType",'__any__'))
);

CREATE OR REPLACE VIEW "v_tariff_latest" AS
SELECT r.*
FROM "TariffRate" r
JOIN "TariffScheme" s ON s.id = r."schemeId"
WHERE (s."effectiveTo" IS NULL OR s."effectiveTo" >= CURRENT_DATE)
  AND s."effectiveFrom" <= CURRENT_DATE;
