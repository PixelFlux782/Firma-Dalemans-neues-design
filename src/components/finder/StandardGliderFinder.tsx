"use client";

import Link from "next/link";
import { useState } from "react";
import type { CommerceProduct } from "@/lib/commerce/types";
import { finderInquiryMessage, standardGliderMatch, type StandardFinderInput } from "@/lib/finder/standard";

export default function StandardGliderFinder({ products }: { products: CommerceProduct[] }) {
  const [input, setInput] = useState<StandardFinderInput>({ frame: "unknown", dimensions: "", floor: "unknown", quantity: 4, model: "", mounting: "unknown", angle: "", height: "", notes: "" });
  const update = (key: keyof StandardFinderInput, value: string | number) => setInput((current) => ({ ...current, [key]: value }));
  const match = standardGliderMatch(input);
  const product = match ? products.find((item) => item.variants.some((variant) => variant.sku === match.sku)) : null;
  const valid = Number.isInteger(input.quantity) && input.quantity > 0 && input.quantity <= 100000;
  const message = finderInquiryMessage(input, product && match ? { title: product.title, sku: match.sku } : undefined);
  const query = new URLSearchParams({ anliegen: "Gleiterberatung", nachricht: message });
  return <div className="space-y-7">
    <div className="premium-card grid gap-5 p-6 sm:grid-cols-2">
      <label>Gestellform<select className="form-input" value={input.frame} onChange={(e) => update("frame", e.target.value)}><option value="unknown">Unbekannt</option><option value="steel">Stahlrohr</option><option>Rundrohr</option><option>Vierkantrohr</option><option>Rechteckrohr</option><option>Ovalrohr</option><option>Freischwinger</option><option>Holzgestell</option></select></label>
      <label>Rohrmaße in mm (Durchmesser oder Breite × Höhe)<input className="form-input" maxLength={100} value={input.dimensions} onChange={(e) => update("dimensions", e.target.value.trim())} /></label>
      <label>Bodenart<select className="form-input" value={input.floor} onChange={(e) => update("floor", e.target.value)}><option value="unknown">Unbekannt / andere</option><option value="hard">Empfindlicher Hartboden (Parkett / Laminat)</option><option value="tile">Fliesen / Stein</option><option value="carpet">Teppichboden</option></select></label>
      <label>Benötigte Anzahl (Stück)<input className="form-input" type="number" min={1} max={100000} value={input.quantity} onChange={(e) => update("quantity", Number(e.target.value))} /></label>
      <label>Bestätigtes Möbelmodell<select className="form-input" value={input.model} onChange={(e) => update("model", e.target.value)}><option value="">Unbekannt / anderes</option><option value="1021">Stapelstuhl Modell 1021</option><option value="310">Klapptisch Modell 310 (nicht 310c)</option></select></label>
      <label>Befestigung / vorhandene Ausführung<select className="form-input" value={input.mounting} onChange={(e) => update("mounting", e.target.value)}><option value="unknown">Unbekannt / andere</option><option value="standard">Kunststoffgleiter Standard</option><option value="joint">Filzgelenkgleiter</option><option value="rivet">Blindniete 4,0 × 10,0 AL/ST</option><option value="nail">Nagel / Dorn zum Einschlagen</option></select></label>
      <label>Abschrägung in Grad<input className="form-input" maxLength={20} value={input.angle} onChange={(e) => update("angle", e.target.value.trim())} /></label>
      <label>Gleiterhöhe in mm<input className="form-input" maxLength={20} value={input.height} onChange={(e) => update("height", e.target.value.trim())} /></label>
      <label className="sm:col-span-2">Weitere Hinweise<textarea className="form-input" maxLength={2000} value={input.notes} onChange={(e) => update("notes", e.target.value)} /></label>
    </div>
    <section className="premium-card space-y-4 p-6" aria-live="polite">
      {product && match && valid ? <><h2 className="section-title">{product.title}</h2><p>Artikelnummer: <strong>{match.sku}</strong></p><p>{match.reason}</p><p>{Math.ceil(input.quantity / 4)} Garnituren = {Math.ceil(input.quantity / 4) * 4} Stück. Preis je Garnitur (4 Stück) auf der Produktseite; Verfügbarkeit und Lieferzeit auf Anfrage.</p><Link className="btn-primary inline-flex" href={`/produkte/artikel/${product.handle}?${new URLSearchParams({ technik: message, garnituren: String(Math.ceil(input.quantity / 4)) }).toString()}`}>Produkt und Ausführung auswählen</Link></> : <><h2 className="section-title">Sondergleiter auf Anfrage</h2><p>Wir helfen Ihnen, den passenden Gleiter zu finden.</p><p>Passung, Verkaufseinheit, Preis und Verfügbarkeit klären wir persönlich.</p></>}
      {valid ? <Link className="btn-secondary inline-flex" href={`/kontakt?${query.toString()}#anfrage`}>Beratungsanfrage mit technischen Angaben</Link> : <p role="alert">Bitte eine gültige Anzahl zwischen 1 und 100.000 Stück angeben.</p>}
    </section>
  </div>;
}
