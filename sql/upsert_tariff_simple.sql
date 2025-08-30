-- == Simple RPC to insert/update a scheme+rate in one call ==
CREATE OR REPLACE FUNCTION upsert_tariff_simple(
  p_country_id uuid,
  p_pro_id uuid,
  p_name text,
  p_stream pack_stream,
  p_effective_from date,
  p_effective_to date,
  p_material text,
  p_packaging_type text,
  p_rate numeric,
  p_currency char(3),
  p_unit text,
  p_source_url text
) RETURNS uuid
LANGUAGE plpgsql AS $$
DECLARE
  v_scheme_id uuid;
  v_rate_id uuid;
BEGIN
  SELECT id INTO v_scheme_id
  FROM "TariffScheme"
  WHERE "countryId"=p_country_id
    AND COALESCE("proId",'00000000-0000-0000-0000-000000000000') = COALESCE(p_pro_id,'00000000-0000-0000-0000-000000000000')
    AND name=p_name AND stream=p_stream AND "effectiveFrom"=p_effective_from
    AND COALESCE("effectiveTo",'2999-12-31'::date)=COALESCE(p_effective_to,'2999-12-31'::date);

  IF v_scheme_id IS NULL THEN
    INSERT INTO "TariffScheme"("countryId","proId",name,stream,"effectiveFrom","effectiveTo","sourceUrl")
    VALUES (p_country_id,p_pro_id,p_name,p_stream,p_effective_from,p_effective_to,p_source_url)
    RETURNING id INTO v_scheme_id;
  END IF;

  INSERT INTO "TariffRate"("schemeId",material,"packagingType",rate,currency,unit,"sourceUrl")
  VALUES (v_scheme_id,p_material,p_packaging_type,p_rate,p_currency,p_unit,p_source_url)
  ON CONFLICT ("schemeId", material, COALESCE("packagingType",'__any__'))
  DO UPDATE SET rate = EXCLUDED.rate,
                currency = EXCLUDED.currency,
                unit = EXCLUDED.unit,
                "sourceUrl" = EXCLUDED."sourceUrl",
                "lastVerifiedAt" = now()
  RETURNING id INTO v_rate_id;

  RETURN v_rate_id;
END $$;
