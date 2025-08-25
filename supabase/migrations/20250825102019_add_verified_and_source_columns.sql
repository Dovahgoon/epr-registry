DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Regulator' AND column_name='lastVerifiedAt'
  ) THEN
    ALTER TABLE "Regulator" ADD COLUMN "lastVerifiedAt" timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Regulator' AND column_name='sourceUrl'
  ) THEN
    ALTER TABLE "Regulator" ADD COLUMN "sourceUrl" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Pro' AND column_name='lastVerifiedAt'
  ) THEN
    ALTER TABLE "Pro" ADD COLUMN "lastVerifiedAt" timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Pro' AND column_name='sourceUrl'
  ) THEN
    ALTER TABLE "Pro" ADD COLUMN "sourceUrl" text;
  END IF;
END $$;

-- Optional backfill so the UI can show "Last verified" immediately
UPDATE "Regulator" SET "lastVerifiedAt" = COALESCE("lastVerifiedAt", now()) WHERE "lastVerifiedAt" IS NULL;
UPDATE "Pro"       SET "lastVerifiedAt" = COALESCE("lastVerifiedAt", now()) WHERE "lastVerifiedAt" IS NULL;
