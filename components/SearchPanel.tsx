"use client";

import { ChangeEvent } from "react";
import Scanner, { type ScanPayload } from "@/components/Scanner";

export type SearchFilters = {
  q: string;
  name: string;
  brand: string;
  sku: string;
  barcode: string;
  ean: string;
  gtin: string;
  cip: string;
  color: string;
  category: string;
  categoryId: string;
  tag: string;
  tagId: string;
  storageConditions: string;
  notes: string;
  perishable: string;
  quarantineDefault: string;
  isActive: string;
  defaultLocationId: string;
  availableStock: string;
  priceHt: string;
  vatRate: string;
  priceTtc: string;
  weightG: string;
  volumeCm3: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
};

export type ExternalSourceSelection = {
  external: boolean;
  google: boolean;
  asf: boolean;
};

type Props = {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onExternalLookup: () => void;
  onScan: (payload: ScanPayload) => void;
  externalSources: ExternalSourceSelection;
  onExternalSourcesChange: (sources: ExternalSourceSelection) => void;
  loading?: boolean;
};

export default function SearchPanel({
  filters,
  onChange,
  onSearch,
  onExternalLookup,
  onScan,
  externalSources,
  onExternalSourcesChange,
  loading
}: Props) {
  const handleChange =
    (key: keyof SearchFilters) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({
      ...filters,
      [key]: event.target.value
    });
  };

  const handleSourceChange =
    (key: keyof ExternalSourceSelection) => (event: ChangeEvent<HTMLInputElement>) => {
      onExternalSourcesChange({
        ...externalSources,
        [key]: event.target.checked
      });
    };

  const sourceLabels = [
    externalSources.external ? "Externe" : null,
    externalSources.google ? "Google" : null,
    externalSources.asf ? "ASF" : null
  ].filter(Boolean) as string[];

  const externalLabel = sourceLabels.length
    ? `Rechercher dans ${sourceLabels.join(" / ")}`
    : "Selectionner une source";

  return (
    <div className="stack">
      <div className="panel-title">Recherche</div>
      <div className="stack">
        <label className="label" htmlFor="q">
          Recherche globale
        </label>
        <input
          id="q"
          className="input"
          placeholder="Nom, marque, EAN..."
          value={filters.q}
          onChange={handleChange("q")}
        />
      </div>
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="name">
            Nom produit
          </label>
          <input id="name" className="input" value={filters.name} onChange={handleChange("name")} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="brand">
            Marque
          </label>
          <input id="brand" className="input" value={filters.brand} onChange={handleChange("brand")} />
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="ean">
            EAN
          </label>
          <input id="ean" className="input" value={filters.ean} onChange={handleChange("ean")} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="gtin">
            GTIN
          </label>
          <input id="gtin" className="input" value={filters.gtin} onChange={handleChange("gtin")} />
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="cip">
            Code CIP
          </label>
          <input id="cip" className="input" value={filters.cip} onChange={handleChange("cip")} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="sku">
            SKU
          </label>
          <input id="sku" className="input" value={filters.sku} onChange={handleChange("sku")} />
        </div>
      </div>
      <div className="stack">
        <label className="label" htmlFor="barcode">
          Code-barres
        </label>
        <input id="barcode" className="input" value={filters.barcode} onChange={handleChange("barcode")} />
      </div>
      <Scanner onScan={onScan} />
      <details className="details">
        <summary className="details-summary">Filtres ASF WMS</summary>
        <div className="details-body stack">
          <div className="grid-2">
            <div className="stack">
              <label className="label" htmlFor="color">
                Couleur
              </label>
              <input id="color" className="input" value={filters.color} onChange={handleChange("color")} />
            </div>
            <div className="stack">
              <label className="label" htmlFor="category">
                Categorie
              </label>
              <input id="category" className="input" value={filters.category} onChange={handleChange("category")} />
            </div>
          </div>
          <div className="grid-2">
            <div className="stack">
              <label className="label" htmlFor="tag">
                Tag
              </label>
              <input id="tag" className="input" value={filters.tag} onChange={handleChange("tag")} />
            </div>
            <div className="stack">
              <label className="label" htmlFor="storageConditions">
                Stockage
              </label>
              <input
                id="storageConditions"
                className="input"
                value={filters.storageConditions}
                onChange={handleChange("storageConditions")}
              />
            </div>
          </div>
          <div className="grid-2">
            <div className="stack">
              <label className="label" htmlFor="categoryId">
                Categorie ID
              </label>
              <input
                id="categoryId"
                className="input"
                value={filters.categoryId}
                onChange={handleChange("categoryId")}
              />
            </div>
            <div className="stack">
              <label className="label" htmlFor="tagId">
                Tag ID
              </label>
              <input id="tagId" className="input" value={filters.tagId} onChange={handleChange("tagId")} />
            </div>
          </div>
          <div className="stack">
            <label className="label" htmlFor="notes">
              Notes
            </label>
            <input id="notes" className="input" value={filters.notes} onChange={handleChange("notes")} />
          </div>
          <div className="grid-3">
            <div className="stack">
              <label className="label" htmlFor="perishable">
                Perissable
              </label>
              <select id="perishable" className="select" value={filters.perishable} onChange={handleChange("perishable")}>
                <option value="">Tous</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
            <div className="stack">
              <label className="label" htmlFor="quarantineDefault">
                Quarantaine
              </label>
              <select
                id="quarantineDefault"
                className="select"
                value={filters.quarantineDefault}
                onChange={handleChange("quarantineDefault")}
              >
                <option value="">Tous</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
            <div className="stack">
              <label className="label" htmlFor="isActive">
                Actif
              </label>
              <select id="isActive" className="select" value={filters.isActive} onChange={handleChange("isActive")}>
                <option value="">Tous</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="stack">
              <label className="label" htmlFor="defaultLocationId">
                Emplacement par defaut
              </label>
              <input
                id="defaultLocationId"
                className="input"
                value={filters.defaultLocationId}
                onChange={handleChange("defaultLocationId")}
              />
            </div>
            <div className="stack">
              <label className="label" htmlFor="availableStock">
                Stock disponible
              </label>
              <input
                id="availableStock"
                className="input"
                value={filters.availableStock}
                onChange={handleChange("availableStock")}
              />
            </div>
          </div>
          <div className="grid-3">
            <div className="stack">
              <label className="label" htmlFor="priceHt">
                Prix HT
              </label>
              <input id="priceHt" className="input" value={filters.priceHt} onChange={handleChange("priceHt")} />
            </div>
            <div className="stack">
              <label className="label" htmlFor="vatRate">
                TVA
              </label>
              <input id="vatRate" className="input" value={filters.vatRate} onChange={handleChange("vatRate")} />
            </div>
            <div className="stack">
              <label className="label" htmlFor="priceTtc">
                Prix TTC
              </label>
              <input id="priceTtc" className="input" value={filters.priceTtc} onChange={handleChange("priceTtc")} />
            </div>
          </div>
          <div className="grid-3">
            <div className="stack">
              <label className="label" htmlFor="weightG">
                Poids (g)
              </label>
              <input id="weightG" className="input" value={filters.weightG} onChange={handleChange("weightG")} />
            </div>
            <div className="stack">
              <label className="label" htmlFor="volumeCm3">
                Volume (cm3)
              </label>
              <input id="volumeCm3" className="input" value={filters.volumeCm3} onChange={handleChange("volumeCm3")} />
            </div>
            <div className="stack">
              <label className="label" htmlFor="lengthCm">
                Longueur (cm)
              </label>
              <input id="lengthCm" className="input" value={filters.lengthCm} onChange={handleChange("lengthCm")} />
            </div>
          </div>
          <div className="grid-2">
            <div className="stack">
              <label className="label" htmlFor="widthCm">
                Largeur (cm)
              </label>
              <input id="widthCm" className="input" value={filters.widthCm} onChange={handleChange("widthCm")} />
            </div>
            <div className="stack">
              <label className="label" htmlFor="heightCm">
                Hauteur (cm)
              </label>
              <input id="heightCm" className="input" value={filters.heightCm} onChange={handleChange("heightCm")} />
            </div>
          </div>
        </div>
      </details>
      <div className="stack">
        <div className="label">Sources internes</div>
        <button className="button" type="button" onClick={onSearch} disabled={loading}>
          {loading ? "Chargement WMS..." : "Afficher la base WMS"}
        </button>
      </div>
      <div className="stack">
        <div className="label">Sources externes</div>
        <label className="subtle">
          <input
            type="checkbox"
            checked={externalSources.external}
            onChange={handleSourceChange("external")}
          />{" "}
          Base de donnees externes
        </label>
        <label className="subtle">
          <input type="checkbox" checked={externalSources.google} onChange={handleSourceChange("google")} /> Recherche
          Google
        </label>
        <label className="subtle">
          <input type="checkbox" checked={externalSources.asf} onChange={handleSourceChange("asf")} /> Recherche
          Base de donnees ASF
        </label>
        <button className="button secondary" type="button" onClick={onExternalLookup} disabled={!sourceLabels.length}>
          {externalLabel}
        </button>
      </div>
    </div>
  );
}
