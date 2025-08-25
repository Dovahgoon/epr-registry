export type CountrySummary = {
  name: string;
  iso2: string;
  slug: string;
  region: string;
  currency: string;
  euMember: boolean;
};

export type ProEntry = { name: string; url?: string; notes?: string };

export type CountryDetail = {
  overview: { status: 'active'|'draft'|'unknown'; scope: string[]; notes?: string };
  regulators: { name: string; role: 'ministry'|'authority'|'register'; url?: string }[];
  producer_register?: { name: string; url?: string };
  reporting?: { frequencies?: string[]; portal?: string; notes?: string };
  pros: ProEntry[];
  links?: { law_texts?: { title?: string; url?: string; year?: number }[] };
};
