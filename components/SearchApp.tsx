"use client";

import { useEffect, useState } from "react";
import SearchPanel, { ExternalSourceSelection, SearchFilters } from "@/components/SearchPanel";
import ProductTable from "@/components/ProductTable";
import ProductDetails from "@/components/ProductDetails";
import Scanner from "@/components/Scanner";
import ExternalResults from "@/components/ExternalResults";

const initialFilters: SearchFilters = {
  q: "",
  name: "",
  brand: "",
  sku: "",
  barcode: "",
  ean: "",
  gtin: "",
  cip: "",
  color: "",
  category: "",
  categoryId: "",
  tag: "",
  tagId: "",
  storageConditions: "",
  notes: "",
  perishable: "",
  quarantineDefault: "",
  isActive: "",
  defaultLocationId: "",
  availableStock: "",
  priceHt: "",
  vatRate: "",
  priceTtc: "",
  weightG: "",
  volumeCm3: "",
  lengthCm: "",
  widthCm: "",
  heightCm: ""
};

type User = {
  id: string;
  email: string;
};

type Product = {
  id: string;
  sku: string | null;
  name: string;
  brand: string | null;
  color: string | null;
  categoryId: number | null;
  categoryName: string | null;
  tags: string[];
  barcode: string | null;
  ean: string | null;
  priceHt: number | null;
  vatRate: number | null;
  priceTtc: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  weightG: number | null;
  volumeCm3: number | null;
  availableStock: number | null;
  defaultLocationId: number | null;
  storageConditions: string | null;
  perishable: boolean | null;
  quarantineDefault: boolean | null;
  notes: string | null;
  photoUrl: string | null;
  isActive: boolean | null;
};

type ExternalSearchResult = {
  id: string;
  source: string;
  sourceLabel: string;
  sourceRef?: string | null;
  title?: string | null;
  snippet?: string | null;
  url?: string | null;
  score?: number;
  isBest?: boolean;
  product?: {
    name: string | null;
    brand: string | null;
    ean: string | null;
    gtin: string | null;
    cip: string | null;
    sku: string | null;
    barcode: string | null;
    priceHt: string | number | null;
    vatRate: string | number | null;
    priceTtc: string | number | null;
    currency: string | null;
  } | null;
};

type Props = {
  user: User;
};

type ExternalNotices = {
  external: string | null;
  google: string | null;
  asf: string | null;
};

export default function SearchApp({ user }: Props) {
  const [filters, setFilters] = useState(initialFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [externalResults, setExternalResults] = useState<ExternalSearchResult[]>([]);
  const [externalNotices, setExternalNotices] = useState<ExternalNotices>({
    external: null,
    google: null,
    asf: null
  });
  const [message, setMessage] = useState<string | null>(null);
  const [internalQueried, setInternalQueried] = useState(false);
  const [externalSources, setExternalSources] = useState<ExternalSourceSelection>({
    external: true,
    google: true,
    asf: true
  });
  const [externalQueried, setExternalQueried] = useState<ExternalSourceSelection>({
    external: false,
    google: false,
    asf: false
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setExternalQueried((prev) => ({
      external: externalSources.external ? prev.external : false,
      google: externalSources.google ? prev.google : false,
      asf: externalSources.asf ? prev.asf : false
    }));
  }, [externalSources]);

  async function loadProducts(nextFilters: SearchFilters = filters) {
    setInternalQueried(true);
    setLoading(true);
    setMessage(null);

    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const response = await fetch(`/api/products?${params.toString()}`);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to load products");
      setLoading(false);
      return;
    }

    const data = payload.data as Product[];
    setProducts(data);
    setSelected((prev) => data.find((item) => item.id === prev?.id) ?? data[0] ?? null);
    setLoading(false);
  }

  async function handleSearch() {
    await loadProducts(filters);
  }

  async function handleExternalLookup() {
    setMessage(null);
    setExternalNotices({ external: null, google: null, asf: null });
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.ean) params.set("ean", filters.ean);
    if (filters.gtin) params.set("gtin", filters.gtin);
    if (filters.cip) params.set("cip", filters.cip);

    const selectedSources = Object.entries(externalSources)
      .filter((entry) => entry[1])
      .map((entry) => entry[0]);
    if (!selectedSources.length) {
      setMessage("Selectionner au moins une source externe.");
      return;
    }
    params.set("sources", selectedSources.join(","));

    if (![filters.q, filters.ean, filters.gtin, filters.cip].some(Boolean)) {
      setMessage("Saisir un mot-cle ou un code (EAN/GTIN/CIP) pour la recherche externe.");
      return;
    }

    setExternalQueried({
      external: externalSources.external,
      google: externalSources.google,
      asf: externalSources.asf
    });

    const response = await fetch(`/api/external/search?${params.toString()}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error ?? "Recherche externe echouee");
      return;
    }

    const data = payload.data as ExternalSearchResult[];
    const warnings = (payload.meta?.warnings as string[] | undefined) ?? [];
    const notice = (payload.meta?.notice as string | undefined) ?? null;
    const nextNotices: ExternalNotices = { external: null, google: null, asf: null };

    if (notice && externalSources.google) {
      nextNotices.google = notice;
    }

    const appendNotice = (key: keyof ExternalNotices, text: string) => {
      nextNotices[key] = nextNotices[key] ? `${nextNotices[key]} | ${text}` : text;
    };

    warnings.forEach((warning) => {
      const lower = warning.toLowerCase();
      if (lower.includes("google")) {
        if (externalSources.google) appendNotice("google", warning);
      } else if (lower.includes("open food") || lower.includes("external datasets")) {
        if (externalSources.external) appendNotice("external", warning);
      } else if (lower.includes("asf wms")) {
        if (externalSources.asf) appendNotice("asf", warning);
      } else if (externalSources.external) {
        appendNotice("external", warning);
      }
    });

    setExternalNotices(nextNotices);

    setExternalResults(data);
  }

  async function handleExternalImport(_result: ExternalSearchResult) {
    setMessage("Import externe indisponible: base ASF WMS en lecture seule.");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  function handleScan(code: string) {
    const cleaned = code.replace(/[\s-]/g, "");
    const next = { ...filters, barcode: cleaned };
    if (cleaned.length === 13) {
      next.ean = cleaned;
    } else if (cleaned.length === 14) {
      next.gtin = cleaned;
    }
    setFilters(next);
    setMessage(`Scan: ${cleaned}`);
    void loadProducts(next);
  }

  return (
    <main className="page">
      <div className="header">
        <div>
          <div className="logo">
            ASF <span>Codesearch</span>
          </div>
          <div className="subtle">Catalogue partage avec recherche multi-criteres.</div>
        </div>
        <div className="stack" style={{ alignItems: "flex-end" }}>
          <div className="subtle">{user.email}</div>
          <button className="button secondary" type="button" onClick={handleLogout}>
            Deconnexion
          </button>
        </div>
      </div>

      <div className="layout">
        <div className="card-grid">
          <div className="panel">
            <SearchPanel
              filters={filters}
              onChange={setFilters}
              onSearch={handleSearch}
              onExternalLookup={handleExternalLookup}
              externalSources={externalSources}
              onExternalSourcesChange={setExternalSources}
              loading={loading}
            />
          </div>
          <div className="panel">
            <Scanner onScan={handleScan} />
          </div>
        </div>

        <div className="card-grid">
          {externalSources.external ? (
            <div className="panel">
              <details className="details" open={externalQueried.external}>
                <summary className="details-summary">Base de donnees externes</summary>
                <div className="details-body">
                  <ExternalResults
                    title={null}
                    emptyLabel="Aucun resultat externe."
                    results={externalResults.filter((result) =>
                      ["open_food_facts", "open_medic", "bdpm"].includes(result.source)
                    )}
                    onImport={handleExternalImport}
                    canImport={false}
                    notice={externalNotices.external}
                  />
                </div>
              </details>
            </div>
          ) : null}
          {externalSources.google ? (
            <div className="panel">
              <details className="details" open={externalQueried.google}>
                <summary className="details-summary">Recherche Google</summary>
                <div className="details-body">
                  <ExternalResults
                    title={null}
                    emptyLabel="Aucun resultat Google."
                    results={externalResults.filter((result) => result.source === "google_cse")}
                    onImport={handleExternalImport}
                    canImport={false}
                    notice={externalNotices.google}
                  />
                </div>
              </details>
            </div>
          ) : null}
          {externalSources.asf ? (
            <div className="panel">
              <details className="details" open={externalQueried.asf}>
                <summary className="details-summary">Recherche Base ASF</summary>
                <div className="details-body">
                  <ExternalResults
                    title={null}
                    emptyLabel="Aucun resultat ASF."
                    results={externalResults.filter((result) => result.source === "asf_wms")}
                    onImport={handleExternalImport}
                    canImport={false}
                    notice={externalNotices.asf}
                  />
                </div>
              </details>
            </div>
          ) : null}
          <div className="panel">
            <details className="details" open={internalQueried}>
              <summary className="details-summary">Resultats</summary>
              <div className="details-body">
                {message ? <div className="notice">{message}</div> : null}
                <ProductTable products={products} selectedId={selected?.id} onSelect={setSelected} />
              </div>
            </details>
          </div>
          <div className="panel">
            <details className="details" open={internalQueried}>
              <summary className="details-summary">Details produit</summary>
              <div className="details-body">
                <ProductDetails product={selected} showTitle={false} />
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
