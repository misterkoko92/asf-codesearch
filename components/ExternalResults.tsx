"use client";

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
  results: ExternalSearchResult[];
  onImport: (result: ExternalSearchResult) => Promise<void>;
  notice?: string | null;
  title?: string | null;
  emptyLabel?: string;
  canImport?: boolean;
};

export default function ExternalResults({
  results,
  onImport,
  notice,
  title,
  emptyLabel,
  canImport = true
}: Props) {
  const panelTitle = title === undefined ? "Sources externes" : title;
  const emptyText = emptyLabel ?? "Aucun resultat externe.";

  return (
    <div className="stack">
      {notice ? <div className="notice">{notice}</div> : null}
      {panelTitle ? <div className="panel-title">{panelTitle}</div> : null}
      {results.length ? (
        results.map((result) => {
          const priceHt = result.product?.priceHt ?? null;
          const priceTtc = result.product?.priceTtc ?? null;
          const hasPriceHt = priceHt !== null && priceHt !== undefined;
          const hasPriceTtc = priceTtc !== null && priceTtc !== undefined;
          const priceValue = hasPriceHt ? priceHt : hasPriceTtc ? priceTtc : null;
          const priceLabel = hasPriceHt ? "HT" : hasPriceTtc ? "TTC" : "";
          const currency = result.product?.currency ?? "EUR";

          return (
            <div key={result.id} className="panel" style={{ boxShadow: "none" }}>
              <div className="stack">
              <div className="toolbar">
                <span className="badge">{result.sourceLabel}</span>
                {result.isBest ? <span className="badge">Meilleur resultat</span> : null}
              </div>
              <div>{result.product?.name ?? result.title ?? "Produit inconnu"}</div>
              <div className="subtle">{result.product?.brand ?? ""}</div>
              {result.snippet ? <div className="subtle">{result.snippet}</div> : null}
              {result.url ? (
                <a href={result.url} target="_blank" rel="noreferrer" className="subtle">
                  {result.url}
                </a>
              ) : null}
              <div className="grid-3">
                <div>
                  <div className="label">EAN</div>
                  <div>{result.product?.ean ?? "-"}</div>
                </div>
                <div>
                  <div className="label">GTIN</div>
                  <div>{result.product?.gtin ?? "-"}</div>
                </div>
                <div>
                  <div className="label">CIP</div>
                  <div>{result.product?.cip ?? "-"}</div>
                </div>
              </div>
              <div className="grid-2">
                <div>
                  <div className="label">SKU</div>
                  <div>{result.product?.sku ?? "-"}</div>
                </div>
                <div>
                  <div className="label">Code barre</div>
                  <div>{result.product?.barcode ?? "-"}</div>
                </div>
              </div>
              <div className="grid-2">
                <div>
                  <div className="label">Prix</div>
                  <div>
                    {priceValue ?? "-"} {priceValue !== null ? currency : ""} {priceLabel}
                  </div>
                </div>
                <div>
                  <div className="label">TVA</div>
                  <div>{result.product?.vatRate ?? "-"}</div>
                </div>
              </div>
              {canImport ? (
                <button className="button" type="button" onClick={() => onImport(result)}>
                  Importer
                </button>
              ) : null}
              </div>
            </div>
          );
        })
      ) : (
        <div className="notice">{emptyText}</div>
      )}
    </div>
  );
}
