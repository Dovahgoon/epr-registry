import { z } from "zod";

export const Link = z.object({
  name: z.string(),
  url: z.string().url().optional(),
});

export const CountryRegistry = z.object({
  country: z.string(), // ISO-2
  updatedAt: z.string().datetime().optional(),
  regulators: z.array(Link).default([]),
  pros: z.array(Link).default([]),
  notes: z.string().optional(),
});
export type CountryRegistry = z.infer<typeof CountryRegistry>;

export const RegistryBundle = z.object({
  ok: z.boolean(),
  year: z.string(),
  items: z.array(CountryRegistry),
  generatedAt: z.string(),
});
export type RegistryBundle = z.infer<typeof RegistryBundle>;
