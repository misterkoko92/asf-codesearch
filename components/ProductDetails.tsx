"use client";

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

type Props = {
  product: Product | null;
  showTitle?: boolean;
};

export default function ProductDetails({ product, showTitle = true }: Props) {
  if (!product) {
    return <div className="notice">Selectionnez un produit pour voir le detail.</div>;
  }

  const priceLabel = product.priceHt !== null ? "HT" : product.priceTtc !== null ? "TTC" : "-";
  const categoryLabel = product.categoryName ?? (product.categoryId ? `#${product.categoryId}` : "-");

  return (
    <div className="stack">
      {showTitle ? <div className="panel-title">Details produit</div> : null}
      <div className="stack">
        <div className="badge">{product.name}</div>
        <div className="subtle">{product.brand ?? "Sans marque"}</div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <div className="label">EAN</div>
          <div>{product.ean ?? "-"}</div>
        </div>
        <div className="stack">
          <div className="label">SKU</div>
          <div>{product.sku ?? "-"}</div>
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <div className="label">Code-barres</div>
          <div>{product.barcode ?? "-"}</div>
        </div>
        <div className="stack">
          <div className="label">Couleur</div>
          <div>{product.color ?? "-"}</div>
        </div>
      </div>
      <div className="stack">
        <div className="label">Categorie</div>
        <div>{categoryLabel}</div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <div className="label">Prix</div>
          <div>
            {product.priceHt ?? product.priceTtc ?? "-"} EUR {priceLabel}
          </div>
        </div>
        <div className="stack">
          <div className="label">TVA</div>
          <div>{product.vatRate ?? "-"}</div>
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <div className="label">Stock disponible</div>
          <div>{product.availableStock ?? "-"}</div>
        </div>
        <div className="stack">
          <div className="label">Emplacement par defaut</div>
          <div>{product.defaultLocationId ?? "-"}</div>
        </div>
      </div>
      <div className="stack">
        <div className="label">Tags</div>
        <div>
          {product.tags && product.tags.length
            ? product.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))
            : "-"}
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <div className="label">Conditions de stockage</div>
          <div>{product.storageConditions ?? "-"}</div>
        </div>
        <div className="stack">
          <div className="label">Actif</div>
          <div>{product.isActive === null ? "-" : product.isActive ? "Oui" : "Non"}</div>
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <div className="label">Perissable</div>
          <div>{product.perishable === null ? "-" : product.perishable ? "Oui" : "Non"}</div>
        </div>
        <div className="stack">
          <div className="label">Quarantaine par defaut</div>
          <div>{product.quarantineDefault === null ? "-" : product.quarantineDefault ? "Oui" : "Non"}</div>
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <div className="label">Poids (g)</div>
          <div>{product.weightG ?? "-"}</div>
        </div>
        <div className="stack">
          <div className="label">Volume (cm3)</div>
          <div>{product.volumeCm3 ?? "-"}</div>
        </div>
      </div>
      <div className="grid-3">
        <div className="stack">
          <div className="label">Longueur (cm)</div>
          <div>{product.lengthCm ?? "-"}</div>
        </div>
        <div className="stack">
          <div className="label">Largeur (cm)</div>
          <div>{product.widthCm ?? "-"}</div>
        </div>
        <div className="stack">
          <div className="label">Hauteur (cm)</div>
          <div>{product.heightCm ?? "-"}</div>
        </div>
      </div>
      {product.notes ? (
        <div className="stack">
          <div className="label">Notes</div>
          <div>{product.notes}</div>
        </div>
      ) : null}
      {product.photoUrl ? (
        <a className="subtle" href={product.photoUrl} target="_blank" rel="noreferrer">
          Voir la photo
        </a>
      ) : null}
    </div>
  );
}
