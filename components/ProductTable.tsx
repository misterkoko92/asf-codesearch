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
  products: Product[];
  selectedId?: string | null;
  onSelect: (product: Product) => void;
};

export default function ProductTable({ products, selectedId, onSelect }: Props) {
  if (!products.length) {
    return <div className="notice">Aucun produit trouve.</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Produit</th>
          <th>Marque</th>
          <th>SKU</th>
          <th>Code-barres</th>
          <th>EAN</th>
          <th>Stock</th>
          <th>Prix</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const price = product.priceHt ?? product.priceTtc;
          const priceLabel = product.priceHt !== null ? "HT" : product.priceTtc !== null ? "TTC" : "-";
          return (
            <tr
              key={product.id}
              onClick={() => onSelect(product)}
              style={{ background: product.id === selectedId ? "rgba(47, 107, 95, 0.12)" : undefined }}
            >
              <td>{product.name}</td>
              <td>{product.brand ?? "-"}</td>
              <td>{product.sku ?? "-"}</td>
              <td>{product.barcode ?? "-"}</td>
              <td>{product.ean ?? "-"}</td>
              <td>{product.availableStock ?? "-"}</td>
              <td>{price !== null ? `${price} EUR ${priceLabel}` : "-"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
