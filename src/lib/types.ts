export type Country = {
  iso2: string;
  country: string;
  languages?: string;
  ppwr_status?: string;
  notes?: string;
};

export type Pro = {
  country: string;
  name: string;
  website?: string;
  covered_materials?: string;
  scope_b2c_b2b?: string;
  signup_link?: string;
  fee_model?: string;
  contact_email?: string;
  contact_phone?: string;
};

export type Rule = {
  country: string;
  registration_steps?: string;
  ids_required?: string;
  thresholds?: string;
  reporting_frequency?: string;
  eco_modulation?: string;
  penalties?: string;
  official_sources?: string;
};

export type Consultant = {
  country: string;
  firm: string;
  services?: string;
  languages?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
};

export type Catalog = {
  countries: Country[];
  pros: Pro[];
  rules: Rule[];
  consultants: Consultant[];
};