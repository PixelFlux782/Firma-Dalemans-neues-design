"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  fabricById,
  fabricsForGroup,
  type FabricCollection,
  type FabricGroup,
} from "@/lib/fabrics";

export interface FabricSelection {
  collectionId: string;
  colorCode?: string;
}

function Detail({ label, children }: { label: string; children?: ReactNode }) {
  if (!children) return null;
  return <div><dt className="text-[0.65rem] font-semibold uppercase tracking-[.14em] text-premium-subtle">{label}</dt><dd className="mt-1 text-sm leading-6 text-premium-charcoal">{children}</dd></div>;
}

export default function FabricSelectionDialog({
  open,
  group,
  value,
  model,
  onChange,
  onClose,
}: {
  open: boolean;
  group: FabricGroup;
  value: FabricSelection | null;
  model: string;
  onChange: (selection: FabricSelection) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const collections = useMemo(() => fabricsForGroup(group), [group]);
  const [activeId, setActiveId] = useState(() => value?.collectionId ?? collections[0]?.id ?? "");
  const active = fabricById(activeId) ?? collections[0];

  useEffect(() => {
    if (!open) return;
    setActiveId(value?.collectionId && fabricById(value.collectionId)?.group === group
      ? value.collectionId
      : collections[0]?.id ?? "");
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }, [collections, group, open, value?.collectionId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || open || !dialog.open) return;
    dialog.close();
  }, [open]);

  if (!active) return null;
  const selectedColor = value?.collectionId === active.id
    ? active.colors.find((color) => color.code === value.colorCode)
    : undefined;
  const inquiryMessage = [
    `Modell: ${model}`,
    `Stoffgruppe: ${group}`,
    `Stoffkollektion: ${active.name}`,
    ...(selectedColor ? [`Farbe: ${selectedColor.name}`, `Farbcode: ${selectedColor.code}`] : []),
  ].join("\n");
  const inquiryHref = `/kontakt?${new URLSearchParams({
    anliegen: "Stoffmuster",
    produkt: model,
    variante: `Gruppe ${group} · ${active.name}${selectedColor ? ` · ${selectedColor.name} ${selectedColor.code}` : ""}`,
    nachricht: inquiryMessage,
  }).toString()}#anfrage`;

  function chooseCollection(collection: FabricCollection) {
    setActiveId(collection.id);
    onChange({ collectionId: collection.id });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="fabric-dialog-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-premium-ink/45 sm:m-auto sm:h-auto sm:max-h-[90vh] sm:w-[min(1120px,calc(100%-2rem))] sm:rounded-4xl"
      data-testid="fabric-dialog"
    >
      <div className="flex h-full flex-col overflow-hidden bg-premium-canvas shadow-2xl sm:max-h-[90vh] sm:rounded-4xl">
        <header className="flex items-start justify-between gap-5 border-b border-premium-beige/80 px-5 py-5 sm:px-8">
          <div>
            <p className="section-eyebrow">Stoffgruppe {group}</p>
            <h2 id="fabric-dialog-title" className="mt-2 font-display text-2xl font-medium text-premium-ink sm:text-3xl">Kollektion und Farbe wählen</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-premium-muted">Die Stoffgruppe ist eine Preis- und Sortimentszuordnung, keine Qualitätsrangfolge.</p>
          </div>
          <button type="button" onClick={onClose} className="flex size-11 shrink-0 items-center justify-center rounded-full border border-premium-beige bg-white text-xl text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand" aria-label="Materialauswahl schließen">×</button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(15rem,.68fr)_minmax(0,1.32fr)] lg:overflow-hidden">
          <nav aria-label="Stoffkollektionen" className="border-b border-premium-beige/80 p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-premium-subtle">Kollektionen</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {collections.map((collection) => {
                const selected = collection.id === active.id;
                return <button
                  key={collection.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseCollection(collection)}
                  className={`rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand ${selected ? "border-premium-forest bg-premium-forest text-white" : "border-premium-beige bg-white/70 text-premium-ink hover:border-premium-sand"}`}
                >
                  <span className="block text-sm font-semibold">{collection.name}</span>
                  <span className="mt-1 block text-xs opacity-70">{collection.materialType}</span>
                </button>;
              })}
            </div>
          </nav>

          <section className="p-5 sm:p-8 lg:overflow-y-auto" aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="section-eyebrow">Kollektion</p><h3 className="mt-2 font-display text-3xl font-medium text-premium-ink">{active.name}</h3><p className="mt-2 text-sm text-premium-muted">{active.materialType}</p></div>
              <span className="rounded-full border border-premium-beige bg-white px-3 py-1.5 text-xs font-semibold text-premium-muted">Stand {active.informationAsOf}</span>
            </div>

            <dl className="mt-6 grid gap-5 rounded-3xl border border-premium-beige/70 bg-white/65 p-5 sm:grid-cols-2">
              <Detail label="Material">{active.composition}</Detail>
              <Detail label="Martindale">{active.martindale}</Detail>
              <Detail label="Eigenschaften">{active.properties.join(" · ")}</Detail>
              <Detail label="Pflege">{active.care}</Detail>
              <Detail label="Brandschutz">{active.fireSafety?.join(" · ")}</Detail>
            </dl>

            <details className="mt-4 rounded-2xl border border-premium-beige/70 bg-premium-warm/55 px-5 py-4">
              <summary className="cursor-pointer text-sm font-semibold text-premium-ink">Was bedeutet Martindale?</summary>
              <p className="mt-3 text-sm leading-6 text-premium-muted">Der Martindale-Wert beschreibt die im Prüfverfahren erreichte Scheuerbeständigkeit des Bezugsmaterials. Er ist eine Vergleichsgröße, aber keine Zusage für eine bestimmte Lebensdauer.</p>
            </details>

            <div className="mt-7">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-premium-ink">Farbe und Farbcode</p><p className="mt-1 text-xs leading-5 text-premium-muted">Nur aktuell in Produktdaten bestätigte Codes sind direkt auswählbar.</p></div><a href={active.colorCardUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline underline-offset-4">Vollständige Farbkarte öffnen ↗</a></div>
              {active.colors.length > 0 ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3" data-testid="fabric-colors">
                  {active.colors.map((color) => {
                    const selected = value?.collectionId === active.id && value.colorCode === color.code;
                    return <button key={color.code} type="button" aria-pressed={selected} onClick={() => onChange({ collectionId: active.id, colorCode: color.code })} className={`min-h-14 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand ${selected ? "border-premium-forest bg-premium-forest text-white" : "border-premium-beige bg-white hover:border-premium-sand"}`}>
                      <span className="block text-sm font-semibold">{color.name}</span><span className="mt-0.5 block text-xs opacity-70">Code {color.code}</span>
                    </button>;
                  })}
                </div>
              ) : <p className="mt-4 rounded-2xl border border-premium-beige/70 bg-white/60 p-4 text-sm leading-6 text-premium-muted">Die aktuelle Gesamtpalette finden Sie in der Farbkarte. Den gewünschten Code übernehmen wir anschließend in Ihre Anfrage.</p>}
            </div>

            <details className="mt-7 rounded-3xl border border-premium-beige/70 bg-white/65 p-5" data-testid="fabric-comparison">
              <summary className="cursor-pointer text-sm font-semibold text-premium-ink">Kollektionen dieser Gruppe vergleichen</summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-xs leading-5">
                  <thead><tr className="border-b border-premium-beige text-premium-subtle"><th className="py-2 pr-4 font-semibold">Kollektion</th><th className="py-2 pr-4 font-semibold">Material</th><th className="py-2 pr-4 font-semibold">Martindale</th><th className="py-2 pr-4 font-semibold">Pflege</th><th className="py-2 pr-4 font-semibold">Eigenschaften</th><th className="py-2 font-semibold">Brandschutz Bezug</th></tr></thead>
                  <tbody>{collections.map((collection) => <tr key={collection.id} className="border-b border-premium-beige/60 align-top last:border-0"><th className="py-3 pr-4 font-semibold text-premium-ink">{collection.name}</th><td className="py-3 pr-4 text-premium-muted">{collection.composition ?? "—"}</td><td className="py-3 pr-4 text-premium-muted">{collection.martindale ?? "—"}</td><td className="py-3 pr-4 text-premium-muted">{collection.care ?? "—"}</td><td className="py-3 pr-4 text-premium-muted">{collection.properties.join(" · ")}</td><td className="py-3 text-premium-muted">{collection.fireSafety?.join(" · ") ?? "—"}</td></tr>)}</tbody>
                </table>
              </div>
            </details>

            <div className="mt-7 rounded-3xl bg-premium-ink p-5 text-white sm:p-6">
              <p className="text-sm font-semibold">Auswahl persönlich absichern</p>
              <p className="mt-2 text-xs leading-6 text-white/70">Bildschirmfarben können vom Original abweichen. Brandschutzangaben zum Bezug gelten nicht automatisch für den vollständigen Stuhl.</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href={inquiryHref} className="btn-primary text-center">Stoffmuster anfragen</Link>
                <Link href="/wissen/stoffe-und-bezuege" className="btn-secondary text-center">Materialratgeber lesen</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </dialog>
  );
}
