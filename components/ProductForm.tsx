"use client";

import { useState } from "react";
import { SourceType } from "@prisma/client";
import type { ProductInput } from "@/lib/normalize";

export type ProductFormMode = "create" | "edit";

type Props = {
  mode: ProductFormMode;
  initial?: ProductInput;
  onSave: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
  showTitle?: boolean;
};

function toText(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

export default function ProductForm({ mode, initial, onSave, onCancel, showTitle = true }: Props) {
  const [form, setForm] = useState(() => ({
    sku: toText(initial?.sku),
    name: toText(initial?.name),
    brand: toText(initial?.brand),
    color: toText(initial?.color),
    categoryL1: toText(initial?.categoryL1),
    categoryL2: toText(initial?.categoryL2),
    categoryL3: toText(initial?.categoryL3),
    categoryL4: toText(initial?.categoryL4),
    tags: toText(initial?.tags),
    warehouse: toText(initial?.warehouse),
    rack: toText(initial?.rack),
    shelf: toText(initial?.shelf),
    bin: toText(initial?.bin),
    rackColor: toText(initial?.rackColor),
    barcode: toText(initial?.barcode),
    ean: toText(initial?.ean),
    gtin: toText(initial?.gtin),
    cip: toText(initial?.cip),
    priceHt: toText(initial?.priceHt),
    vatRate: toText(initial?.vatRate),
    priceTtc: toText(initial?.priceTtc),
    currency: toText(initial?.currency || "EUR"),
    lengthCm: toText(initial?.lengthCm),
    widthCm: toText(initial?.widthCm),
    heightCm: toText(initial?.heightCm),
    weightG: toText(initial?.weightG),
    volumeCm3: toText(initial?.volumeCm3),
    quantity: toText(initial?.quantity),
    storageConditions: toText(initial?.storageConditions),
    perishable: Boolean(initial?.perishable),
    quarantineDefault: Boolean(initial?.quarantineDefault),
    notes: toText(initial?.notes),
    photoUrl: toText(initial?.photoUrl),
    sourceType: toText(initial?.sourceType || "manual"),
    sourceName: toText(initial?.sourceName),
    sourceSupplier: toText(initial?.sourceSupplier),
    sourceRef: toText(initial?.sourceRef)
  }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = event.target;
    const { name, value } = target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function handleCheck(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: checked
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.name.trim()) {
      setError("Name is required");
      setSaving(false);
      return;
    }

    const payload: ProductInput = {
      ...form,
      sourceType: form.sourceType as SourceType,
      perishable: form.perishable,
      quarantineDefault: form.quarantineDefault
    };

    await onSave(payload).catch((err) => {
      setError(err?.message ?? "Save failed");
    });
    setSaving(false);
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      {showTitle ? <div className="panel-title">{mode === "create" ? "Nouveau produit" : "Modifier produit"}</div> : null}
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="name">
            Nom
          </label>
          <input id="name" name="name" className="input" value={form.name} onChange={handleChange} required />
        </div>
        <div className="stack">
          <label className="label" htmlFor="brand">
            Marque
          </label>
          <input id="brand" name="brand" className="input" value={form.brand} onChange={handleChange} />
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="sku">
            SKU
          </label>
          <input id="sku" name="sku" className="input" value={form.sku} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="color">
            Couleur
          </label>
          <input id="color" name="color" className="input" value={form.color} onChange={handleChange} />
        </div>
      </div>
      <div className="grid-3">
        <div className="stack">
          <label className="label" htmlFor="ean">
            EAN
          </label>
          <input id="ean" name="ean" className="input" value={form.ean} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="gtin">
            GTIN
          </label>
          <input id="gtin" name="gtin" className="input" value={form.gtin} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="cip">
            CIP
          </label>
          <input id="cip" name="cip" className="input" value={form.cip} onChange={handleChange} />
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="barcode">
            Code-barres
          </label>
          <input id="barcode" name="barcode" className="input" value={form.barcode} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="tags">
            Tags (virgule ou |)
          </label>
          <input id="tags" name="tags" className="input" value={form.tags} onChange={handleChange} />
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="categoryL1">
            Categorie L1
          </label>
          <input id="categoryL1" name="categoryL1" className="input" value={form.categoryL1} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="categoryL2">
            Categorie L2
          </label>
          <input id="categoryL2" name="categoryL2" className="input" value={form.categoryL2} onChange={handleChange} />
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="categoryL3">
            Categorie L3
          </label>
          <input id="categoryL3" name="categoryL3" className="input" value={form.categoryL3} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="categoryL4">
            Categorie L4
          </label>
          <input id="categoryL4" name="categoryL4" className="input" value={form.categoryL4} onChange={handleChange} />
        </div>
      </div>
      <div className="section-divider" />
      <div className="grid-3">
        <div className="stack">
          <label className="label" htmlFor="priceHt">
            Prix HT
          </label>
          <input id="priceHt" name="priceHt" className="input" value={form.priceHt} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="vatRate">
            TVA %
          </label>
          <input id="vatRate" name="vatRate" className="input" value={form.vatRate} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="priceTtc">
            Prix TTC
          </label>
          <input id="priceTtc" name="priceTtc" className="input" value={form.priceTtc} onChange={handleChange} />
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="currency">
            Devise
          </label>
          <input id="currency" name="currency" className="input" value={form.currency} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="quantity">
            Quantite
          </label>
          <input id="quantity" name="quantity" className="input" value={form.quantity} onChange={handleChange} />
        </div>
      </div>
      <div className="section-divider" />
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="warehouse">
            Entrepot
          </label>
          <input id="warehouse" name="warehouse" className="input" value={form.warehouse} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="rack">
            Rack
          </label>
          <input id="rack" name="rack" className="input" value={form.rack} onChange={handleChange} />
        </div>
      </div>
      <div className="grid-3">
        <div className="stack">
          <label className="label" htmlFor="shelf">
            Etagere
          </label>
          <input id="shelf" name="shelf" className="input" value={form.shelf} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="bin">
            Bac
          </label>
          <input id="bin" name="bin" className="input" value={form.bin} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="rackColor">
            Couleur rack
          </label>
          <input id="rackColor" name="rackColor" className="input" value={form.rackColor} onChange={handleChange} />
        </div>
      </div>
      <div className="section-divider" />
      <div className="grid-3">
        <div className="stack">
          <label className="label" htmlFor="lengthCm">
            Longueur (cm)
          </label>
          <input id="lengthCm" name="lengthCm" className="input" value={form.lengthCm} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="widthCm">
            Largeur (cm)
          </label>
          <input id="widthCm" name="widthCm" className="input" value={form.widthCm} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="heightCm">
            Hauteur (cm)
          </label>
          <input id="heightCm" name="heightCm" className="input" value={form.heightCm} onChange={handleChange} />
        </div>
      </div>
      <div className="grid-3">
        <div className="stack">
          <label className="label" htmlFor="weightG">
            Poids (g)
          </label>
          <input id="weightG" name="weightG" className="input" value={form.weightG} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="volumeCm3">
            Volume (cm3)
          </label>
          <input id="volumeCm3" name="volumeCm3" className="input" value={form.volumeCm3} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="storageConditions">
            Conditions stockage
          </label>
          <input
            id="storageConditions"
            name="storageConditions"
            className="input"
            value={form.storageConditions}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="grid-2">
        <label className="label">
          <input
            type="checkbox"
            name="perishable"
            checked={form.perishable}
            onChange={handleCheck}
            style={{ marginRight: "8px" }}
          />
          Perissable
        </label>
        <label className="label">
          <input
            type="checkbox"
            name="quarantineDefault"
            checked={form.quarantineDefault}
            onChange={handleCheck}
            style={{ marginRight: "8px" }}
          />
          Quarantaine par defaut
        </label>
      </div>
      <div className="stack">
        <label className="label" htmlFor="notes">
          Notes
        </label>
        <textarea id="notes" name="notes" className="textarea" value={form.notes} onChange={handleChange} />
      </div>
      <div className="stack">
          <label className="label" htmlFor="photoUrl">
            URL photo
          </label>
        <input id="photoUrl" name="photoUrl" className="input" value={form.photoUrl} onChange={handleChange} />
      </div>
      <div className="section-divider" />
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="sourceType">
            Type source
          </label>
          <select id="sourceType" name="sourceType" className="select" value={form.sourceType} onChange={handleChange}>
            <option value="manual">Manual</option>
            <option value="csv">CSV</option>
            <option value="external">External</option>
          </select>
        </div>
        <div className="stack">
          <label className="label" htmlFor="sourceName">
            Nom source
          </label>
          <input id="sourceName" name="sourceName" className="input" value={form.sourceName} onChange={handleChange} />
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <label className="label" htmlFor="sourceSupplier">
            Fournisseur source
          </label>
          <input id="sourceSupplier" name="sourceSupplier" className="input" value={form.sourceSupplier} onChange={handleChange} />
        </div>
        <div className="stack">
          <label className="label" htmlFor="sourceRef">
            Reference source
          </label>
          <input id="sourceRef" name="sourceRef" className="input" value={form.sourceRef} onChange={handleChange} />
        </div>
      </div>
      {error ? <div className="notice">{error}</div> : null}
      <div className="toolbar">
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button className="button secondary" type="button" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
