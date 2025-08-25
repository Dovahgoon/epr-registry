-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."RegulatorRole" AS ENUM ('ministry', 'authority', 'register');

-- CreateTable
CREATE TABLE "public"."Country" (
    "id" SERIAL NOT NULL,
    "iso2" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "region" TEXT,
    "currency" TEXT,
    "euMember" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Regulator" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."RegulatorRole" NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Regulator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProducerRegister" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "ProducerRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reporting" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "frequencies" TEXT[],
    "portal" TEXT,
    "notes" TEXT,

    CONSTRAINT "Reporting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pro" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "notes" TEXT,

    CONSTRAINT "Pro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LawLink" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "url" TEXT,

    CONSTRAINT "LawLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso2_key" ON "public"."Country"("iso2");

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "public"."Country"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProducerRegister_countryId_key" ON "public"."ProducerRegister"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Reporting_countryId_key" ON "public"."Reporting"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Pro_countryId_name_key" ON "public"."Pro"("countryId", "name");

-- AddForeignKey
ALTER TABLE "public"."Regulator" ADD CONSTRAINT "Regulator_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProducerRegister" ADD CONSTRAINT "ProducerRegister_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reporting" ADD CONSTRAINT "Reporting_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pro" ADD CONSTRAINT "Pro_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LawLink" ADD CONSTRAINT "LawLink_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

