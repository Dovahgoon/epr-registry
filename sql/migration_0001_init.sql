-- Offline schema migration for EPR / PPWR Directory (run in Supabase SQL Editor)

create type "RegulatorRole" as enum ('ministry','authority','register');

create table "Country" (
  "id" serial primary key,
  "iso2" text not null unique,
  "name" text not null,
  "slug" text not null unique,
  "region" text,
  "currency" text,
  "euMember" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table "Regulator" (
  "id" serial primary key,
  "countryId" integer not null references "Country"("id") on delete cascade,
  "name" text not null,
  "role" "RegulatorRole" not null,
  "url" text,
  "createdAt" timestamptz not null default now()
);

create table "ProducerRegister" (
  "id" serial primary key,
  "countryId" integer not null unique references "Country"("id") on delete cascade,
  "name" text not null,
  "url" text
);

create table "Reporting" (
  "id" serial primary key,
  "countryId" integer not null unique references "Country"("id") on delete cascade,
  "frequencies" text[] not null default '{}',
  "portal" text,
  "notes" text
);

create table "Pro" (
  "id" serial primary key,
  "countryId" integer not null references "Country"("id") on delete cascade,
  "name" text not null,
  "url" text,
  "notes" text,
  constraint "Pro_country_name_unique" unique ("countryId","name")
);

create table "LawLink" (
  "id" serial primary key,
  "countryId" integer not null references "Country"("id") on delete cascade,
  "title" text not null,
  "year" integer,
  "url" text
);

create index "idx_pro_country" on "Pro" ("countryId");
create index "idx_regulator_country" on "Regulator" ("countryId");
