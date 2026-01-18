# ASF Codesearch

Web app for multi-criteria product search (EAN, GTIN, CIP, name, brand) with camera scan, CSV import, and external connectors.

## Stack
- Next.js (App Router)
- PostgreSQL + Prisma
- JWT auth (email/password)
- CSV import with PapaParse
- Barcode scan with ZXing

## Setup

1) Install dependencies:

```bash
npm install
```

2) Create `.env` from `.env.example` and set:

- `DATABASE_URL`
- `AUTH_SECRET`
- `COUNTRY_CODE` (default `FR`)

3) Create the database schema:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4) Start the app:

```bash
npm run dev
```

## CSV import

The CSV import expects these headers (tab-separated is ok):

```
sku	nom	marque	couleur	category_l1	category_l2	category_l3	category_l4	tags	entrepot	rack	etagere	bac	rack_color	barcode	ean	pu_ht	tva	pu_ttc	length_cm	width_cm	height_cm	weight_g	volume_cm3	quantity	storage_conditions	perishable	quarantine_default	notes	photo
```

Upload CSV in the UI. You can name the source for traceability.

## External sources

Enabled connectors:
- Open Food Facts (EAN/GTIN lookup via API)
- BDPM / Open Medic (import as datasets, then lookup by CIP)
- Google Custom Search (optional, limited free quota)

### Import external datasets

Use the helper script to load a dataset into `ExternalProduct`:

```bash
node scripts/import-external.mjs --source open_medic --file ./data/open_medic.csv \
  --map name=LIBELLE --map cip=CIP7 --map ean=EAN13 --map gtin=GTIN14
```

You can use `--dry-run` and `--limit 1000` to validate the mapping.

### Google Custom Search (optional)

If you want web results, create a Google Programmable Search Engine and set:

```
EXTERNAL_GOOGLE_ENABLED="true"
GOOGLE_CSE_API_KEY="..."
GOOGLE_CSE_ID="..."
```

This uses the free quota (~100 requests/day).

The app enforces a daily Google CSE limit (default 100) that resets at 08:00 Europe/Paris time.
Optional overrides:

```
EXTERNAL_GOOGLE_DAILY_LIMIT="100"
EXTERNAL_GOOGLE_RESET_HOUR="8"
EXTERNAL_GOOGLE_TIMEZONE="Europe/Paris"
```

### ASF WMS (read-only)

If you want to query `asf-wms` from the external search panel, set:

```
ASF_WMS_BASE_URL="https://your-wms-host"
ASF_WMS_API_KEY="..."
```

`ASF_WMS_BASE_URL` should point to the root of the WMS app (the API path `/api/v1/products/` is used under the hood).
The API key must match `INTEGRATION_API_KEY` in the `asf-wms` environment.

## Deployment (recommended)

- Vercel for the Next.js app
- Supabase for Postgres

Set environment variables on Vercel to match `.env`.

## Future integration

This app is structured to allow sync with `asf-wms` later. A stub endpoint exists at `POST /api/integrations/asf-wms/push` and uses `ASF_WMS_BASE_URL` when implemented.
