Place these files under: data/countries/

Required file names and headers:
- countries.csv:      iso2,name
- pros.csv:           countryIso2,name,type
- rules.csv:          countryIso2,regime,law,notes
- consultants.csv:    countryIso2,name,email

Notes:
- Use ISO-2 country codes (DE, GR, FR...). The loader uppercases automatically.
- Delimiters: comma, semicolon, or tab are all supported.
- After copying/updating CSVs, either restart the server or visit /api/reload to clear cache.
- Verify loaded data at /api/debug-data (shows counts & first rows).
