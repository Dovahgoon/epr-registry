-- 20250830_01_tariff_sources.sql
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'parsing_method') THEN
    CREATE TYPE parsing_method AS ENUM ('html','pdf','xlsx','csv','api','manual');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_type') THEN
    CREATE TYPE price_type AS ENUM ('public_official','contractual','regulator_fee','deposit');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.tariff_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_iso text NOT NULL CHECK (char_length(country_iso)=2),
  scheme_name text,
  pro_name text,
  source_url text NOT NULL,
  parsing_method parsing_method NOT NULL DEFAULT 'manual',
  price_type price_type NOT NULL DEFAULT 'public_official',
  official boolean NOT NULL DEFAULT true,
  notes text,
  last_verified_at timestamptz,
  source_hash text,
  CONSTRAINT uq_tariff_source UNIQUE (country_iso, source_url)
);

CREATE INDEX IF NOT EXISTS idx_tariff_sources_country ON public.tariff_sources(country_iso);

ALTER TABLE public.tariff_sources ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tariff_sources' AND policyname='tariff_sources_read') THEN
    CREATE POLICY tariff_sources_read ON public.tariff_sources FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tariff_sources' AND policyname='tariff_sources_insert') THEN
    CREATE POLICY tariff_sources_insert ON public.tariff_sources FOR INSERT TO service_role WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tariff_sources' AND policyname='tariff_sources_update') THEN
    CREATE POLICY tariff_sources_update ON public.tariff_sources FOR UPDATE TO service_role USING (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.upsert_tariff_source(
  p_country_iso text,
  p_scheme_name text,
  p_pro_name text,
  p_source_url text,
  p_parsing_method parsing_method,
  p_price_type price_type,
  p_official boolean,
  p_notes text,
  p_last_verified_at timestamptz,
  p_source_hash text
) RETURNS uuid AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.tariff_sources(country_iso, scheme_name, pro_name, source_url, parsing_method, price_type, official, notes, last_verified_at, source_hash)
  VALUES (p_country_iso, p_scheme_name, p_pro_name, p_source_url, p_parsing_method, p_price_type, p_official, p_notes, p_last_verified_at, p_source_hash)
  ON CONFLICT (country_iso, source_url) DO UPDATE SET
    scheme_name = EXCLUDED.scheme_name,
    pro_name = EXCLUDED.pro_name,
    parsing_method = EXCLUDED.parsing_method,
    price_type = EXCLUDED.price_type,
    official = EXCLUDED.official,
    notes = EXCLUDED.notes,
    last_verified_at = EXCLUDED.last_verified_at,
    source_hash = EXCLUDED.source_hash
  RETURNING id INTO v_id;
  RETURN v_id;
END
$$ LANGUAGE plpgsql SECURITY DEFINER;
