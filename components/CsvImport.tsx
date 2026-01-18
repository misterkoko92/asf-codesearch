"use client";

import { useState } from "react";

type Props = {
  onImported: () => void;
  showTitle?: boolean;
};

export default function CsvImport({ onImported, showTitle = true }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("CSV import");
  const [sourceSupplier, setSourceSupplier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setResult(null);

    const text = await file.text();
    const response = await fetch("/api/import/csv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        csv: text,
        sourceName,
        sourceSupplier: sourceSupplier || undefined
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setResult(payload.error ?? "Import failed");
    } else {
      const data = payload.data as { created: number; updated: number; skipped: number };
      setResult(`Imported. Created: ${data.created}, Updated: ${data.updated}, Skipped: ${data.skipped}`);
      onImported();
    }

    setLoading(false);
  }

  return (
    <div className="stack">
      {showTitle ? <div className="panel-title">Import CSV</div> : null}
      <div className="stack">
        <label className="label" htmlFor="sourceName">
          Nom source
        </label>
        <input
          id="sourceName"
          className="input"
          value={sourceName}
          onChange={(event) => setSourceName(event.target.value)}
        />
      </div>
      <div className="stack">
        <label className="label" htmlFor="sourceSupplier">
          Fournisseur / systeme
        </label>
        <input
          id="sourceSupplier"
          className="input"
          value={sourceSupplier}
          onChange={(event) => setSourceSupplier(event.target.value)}
        />
      </div>
      <label className="button ghost" style={{ textAlign: "center" }}>
        {loading ? "Import..." : fileName ? `Selection: ${fileName}` : "Importer CSV"}
        <input type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFileChange} />
      </label>
      {result ? <div className="notice">{result}</div> : null}
    </div>
  );
}
