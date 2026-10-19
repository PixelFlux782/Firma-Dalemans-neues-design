"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";
import { fabricById, fabricsForGroup, type FabricCollection, type FabricGroup } from "@/lib/fabrics";

export interface FabricSelection {
  collectionId: string;
  colorCode?: string;
}

const fabricGroups: FabricGroup[] = [2, 3, 4];

function Detail({ label, children }: { label: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-[0.65rem] font-semibold uppercase tracking-[.14em] text-premium-subtle">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-premium-charcoal">{children}</dd>
    </div>
  );
}

export default function FabricSelectionDialog({
  open,
  group,
  value,
  model,
  onGroupChange,
  onChange,
  onClose,
}: {
  open: boolean;
  group: FabricGroup;
  value: FabricSelection | null;
  model: string;
  onGroupChange: (group: FabricGroup) => void;
  onChange: (selection: FabricSelection) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const colorCardTriggerRef = useRef<HTMLButtonElement>(null);
  const colorCardCloseRef = useRef<HTMLButtonElement>(null);
  const collections = useMemo(() => fabricsForGroup(group), [group]);
  const [activeId, setActiveId] = useState(() => value?.collectionId ?? collections[0]?.id ?? "");
  const [colorCardOpen, setColorCardOpen] = useState(false);
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
    setColorCardOpen(false);
    dialog.close();
  }, [open]);

  useEffect(() => {
    if (colorCardOpen) colorCardCloseRef.current?.focus();
  }, [colorCardOpen]);

  const selectedColor = active && value?.collectionId === active.id
    ? active.colors.find((color) => color.code === value.colorCode)
    : undefined;
  const inquiryMessage = active ? [
    `Modell: ${model}`,
    `Stoffgruppe: ${group}`,
    `Stoffkollektion: ${active.name}`,
    ...(selectedColor ? [`Farbe: ${selectedColor.name}`, `Farbcode: ${selectedColor.code}`] : []),
  ].join("\n") : `Modell: ${model}\nStoffgruppe: ${group}`;
  const inquiryHref = `/kontakt?${new URLSearchParams({
    anliegen: "Stoffmuster",
    produkt: model,
    variante: active
      ? `Gruppe ${group} · ${active.name}${selectedColor ? ` · ${selectedColor.name} ${selectedColor.code}` : ""}`
      : `Gruppe ${group}`,
    nachricht: inquiryMessage,
  }).toString()}#anfrage`;

  function chooseCollection(collection: FabricCollection) {
    setColorCardOpen(false);
    setActiveId(collection.id);
    onChange({ collectionId: collection.id });
  }

  function closeColorCard() {
    setColorCardOpen(false);
    requestAnimationFrame(() => colorCardTriggerRef.current?.focus());
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    if (colorCardOpen) {
      closeColorCard();
      return;
    }
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="fabric-dialog-title"
      onCancel={handleCancel}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-0 mt-auto h-[92dvh] max-h-none w-full max-w-none overflow-visible rounded-t-[2rem] bg-transparent p-0 backdrop:bg-premium-ink/40 backdrop:backdrop-blur-[1px] md:ml-auto md:mr-0 md:mt-0 md:h-dvh md:w-[min(780px,calc(100%-2rem))] md:rounded-none"
      data-testid="fabric-dialog"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-t-[2rem] bg-premium-canvas shadow-2xl md:rounded-none">
        <header className="shrink-0 border-b border-premium-beige/80 bg-premium-canvas px-5 pb-4 pt-5 sm:px-7" aria-hidden={colorCardOpen} inert={colorCardOpen}>
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="section-eyebrow">Materialberater</p>
              <h2 id="fabric-dialog-title" className="mt-1 font-display text-2xl font-medium text-premium-ink sm:text-3xl">Stoffgruppe {group}</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-premium-muted">Echte Kollektionen, verfügbare Farben und belegte technische Angaben.</p>
            </div>
            <button type="button" onClick={onClose} className="flex size-11 shrink-0 items-center justify-center rounded-full border border-premium-beige bg-white text-xl text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand" aria-label="Materialberater schließen">×</button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Stoffgruppe im Materialberater">
            {fabricGroups.map((entry) => (
              <button key={entry} type="button" aria-pressed={entry === group} onClick={() => onGroupChange(entry)} className={`min-h-10 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand ${entry === group ? "border-premium-forest bg-premium-forest text-white" : "border-premium-beige bg-white/70 text-premium-ink hover:border-premium-sand"}`}>
                Gruppe {entry}
              </button>
            ))}
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[13.5rem_minmax(0,1fr)] md:overflow-hidden" aria-hidden={colorCardOpen} inert={colorCardOpen}>
          <nav aria-label="Stoffkollektionen" className="border-b border-premium-beige/80 p-5 md:overflow-y-auto md:border-b-0 md:border-r">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-premium-subtle">Kollektionen</p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:grid md:overflow-visible">
              {collections.map((collection) => {
                const selected = collection.id === active?.id;
                return (
                  <button key={collection.id} type="button" aria-pressed={selected} onClick={() => chooseCollection(collection)} className={`min-w-40 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand md:min-w-0 ${selected ? "border-premium-forest bg-premium-forest text-white" : "border-premium-beige bg-white/70 text-premium-ink hover:border-premium-sand"}`}>
                    <span className="block text-sm font-semibold">{collection.name}</span>
                    <span className="mt-1 block text-xs opacity-70">{collection.materialType}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <section className="p-5 sm:p-7 md:overflow-y-auto" aria-live="polite">
            {active ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="section-eyebrow">Kollektion</p>
                    <h3 className="mt-1 font-display text-3xl font-medium text-premium-ink">{active.name}</h3>
                    <p className="mt-1 text-sm text-premium-muted">{active.materialType}</p>
                  </div>
                  <span className="rounded-full border border-premium-beige bg-white px-3 py-1.5 text-xs font-semibold text-premium-muted">Stand {active.informationAsOf}</span>
                </div>

                <figure className="mt-5 overflow-hidden rounded-3xl border border-premium-beige/70 bg-white">
                  <div className="relative aspect-[16/9] bg-white">
                    <Image src={`/materials/fabrics/previews/${active.id}.webp`} alt={`Original-Farbkarte der Stoffkollektion ${active.name}`} fill sizes="(min-width: 768px) 500px, 100vw" className="object-contain" />
                  </div>
                  <figcaption className="border-t border-premium-beige/70 px-4 py-3 text-xs leading-5 text-premium-muted">Ausschnitt aus der freigegebenen Original-Farbkarte. Bildschirmfarben können vom Stoffmuster abweichen.</figcaption>
                </figure>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-premium-ink">Verfügbare Farben</p>
                  <p className="mt-1 text-xs leading-5 text-premium-muted">Direkt auswählbar sind ausschließlich bestätigte Farbcodes aus unserem Sortiment.</p>
                  {active.colors.length > 0 ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2" data-testid="fabric-colors">
                      {active.colors.map((color) => {
                        const selected = value?.collectionId === active.id && value.colorCode === color.code;
                        return (
                          <button key={color.code} type="button" aria-pressed={selected} onClick={() => onChange({ collectionId: active.id, colorCode: color.code })} className={`min-h-14 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand ${selected ? "border-premium-forest bg-premium-forest text-white" : "border-premium-beige bg-white hover:border-premium-sand"}`}>
                            <span className="block text-sm font-semibold">{color.name}</span>
                            <span className="mt-0.5 block text-xs opacity-70">Farbcode {color.code}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl border border-premium-beige/70 bg-premium-warm/55 p-4">
                      <p className="text-sm leading-6 text-premium-muted">Für diese Kollektion sind noch keine einzelnen Farbcodes aus unserem Sortiment hinterlegt. Wir stellen Ihnen persönlich eine passende Musterauswahl zusammen.</p>
                      <Link href={inquiryHref} className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-premium-forest underline underline-offset-4">Farben und Stoffmuster anfragen →</Link>
                    </div>
                  )}
                </div>

                <dl className="mt-6 grid gap-x-5 gap-y-4 rounded-3xl border border-premium-beige/70 bg-white/65 p-5 sm:grid-cols-2">
                  <Detail label="Material">{active.composition}</Detail>
                  <Detail label="Scheuerbeständigkeit">{active.martindale}</Detail>
                  <Detail label="Eigenschaften">{active.properties.length > 0 ? active.properties.join(" · ") : undefined}</Detail>
                  <Detail label="Pflege">{active.care}</Detail>
                  <Detail label="Brandschutz & Zertifikate">{active.fireSafety?.join(" · ")}</Detail>
                </dl>

                {active.colorCardPublicationStatus === "approved" ? (
                  <button ref={colorCardTriggerRef} type="button" onClick={() => setColorCardOpen(true)} className="mt-4 inline-flex min-h-12 w-full items-center justify-between gap-4 rounded-2xl border border-premium-beige/70 bg-white/65 px-5 py-3 text-left text-sm font-semibold text-premium-forest transition hover:border-premium-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand" data-testid="fabric-color-card">
                    <span>Farbkarte &amp; technische Daten öffnen</span><span aria-hidden="true">→</span>
                  </button>
                ) : null}

                <div className="mt-6 rounded-3xl bg-premium-ink p-5 text-white">
                  <p className="text-sm font-semibold">Auswahl persönlich absichern</p>
                  <p className="mt-2 text-xs leading-6 text-white/70">Brandschutzangaben zum Bezug gelten nicht automatisch für den vollständigen Stuhl oder jeden Polsteraufbau.</p>
                  <Link href={inquiryHref} className="btn-primary mt-4 w-full text-center sm:w-auto">Stoffmuster anfragen</Link>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-premium-beige/70 bg-white p-6">
                <h3 className="font-display text-2xl font-medium text-premium-ink">Persönliche Stoffberatung</h3>
                <p className="mt-3 text-sm leading-7 text-premium-muted">Für diese Stoffgruppe liegen aktuell keine verwertbaren Detaildaten vor. Wir beraten Sie persönlich und stellen verfügbare Stoffmuster zusammen.</p>
                <Link href={inquiryHref} className="btn-primary mt-5">Stoffberatung anfragen</Link>
              </div>
            )}
          </section>
        </div>

        {colorCardOpen && active ? (
          <section className="absolute inset-0 z-10 flex min-h-0 flex-col bg-premium-canvas" aria-labelledby="fabric-color-card-title" data-testid="fabric-color-card-preview">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-premium-beige/80 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0"><p className="section-eyebrow">Originalunterlagen</p><h3 id="fabric-color-card-title" className="truncate font-display text-xl font-medium text-premium-ink sm:text-2xl">{active.name}</h3></div>
              <div className="flex shrink-0 items-center gap-2">
                <a href={active.colorCardUrl} target="_blank" rel="noreferrer" className="hidden min-h-11 items-center rounded-full border border-premium-beige bg-white px-4 text-sm font-semibold text-premium-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand sm:inline-flex">In neuem Tab öffnen ↗</a>
                <button ref={colorCardCloseRef} type="button" onClick={closeColorCard} className="inline-flex min-h-11 items-center rounded-full border border-premium-beige bg-white px-4 text-sm font-semibold text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand" aria-label="Farbkarte schließen und zum Materialberater zurückkehren"><span aria-hidden="true">←</span><span className="ml-2">Zurück</span></button>
              </div>
            </header>
            <iframe src={active.colorCardUrl} title={`Farbkarte und technische Daten ${active.name}`} loading="lazy" className="min-h-0 flex-1 bg-white" data-testid="fabric-color-card-document" />
            <div className="shrink-0 border-t border-premium-beige/80 bg-white p-3 text-center sm:hidden"><a href={active.colorCardUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline underline-offset-4">Farbkarte in neuem Tab öffnen ↗</a></div>
          </section>
        ) : null}
      </div>
    </dialog>
  );
}
