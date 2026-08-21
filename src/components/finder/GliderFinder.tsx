"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CommerceMedia from "@/components/commerce/CommerceMedia";
import { useCart } from "@/components/commerce/cart/CartProvider";
import MeasurementGuide from "@/components/finder/MeasurementGuide";
import { canAddVariantToCart, cartLineFromProduct } from "@/lib/commerce/cart/lines";
import type {
  CommerceFinderFloorType,
  CommerceFinderFrameShape,
  CommerceFinderItemType,
  CommerceProduct,
} from "@/lib/commerce/types";
import { recommendGliders } from "@/lib/finder/recommend";
import {
  floorTypeLabels,
  frameShapeLabels,
  itemTypeLabels,
  requiredDimensionKeys,
} from "@/lib/finder/rules";
import type {
  FinderDimensions,
  FinderFloorType,
  FinderFrameShape,
  FinderInput,
  FinderMatch,
  FinderQuantityResult,
  FinderResult,
} from "@/lib/finder/types";

const CONTACT_HREF = "/kontakt?anliegen=Gleiter-Beratung";
const stepNames = ["Produktart", "Gestellform", "Maß", "Boden", "Anzahl"] as const;
const allFloors: CommerceFinderFloorType[] = [
  "parquet",
  "laminate",
  "vinyl",
  "tile_stone",
  "carpet",
  "mixed",
];

function formatMillimeters(value: number) {
  return value.toLocaleString("de-DE", { maximumFractionDigits: 1 });
}

function nominalDimension(match: FinderMatch) {
  const nominal = match.variant.finderAttributes!.nominalDimensions;
  return nominal.diameter !== undefined
    ? `${formatMillimeters(nominal.diameter)} mm`
    : `${formatMillimeters(nominal.width!)} × ${formatMillimeters(nominal.height!)} mm`;
}

function dimensionRange(match: FinderMatch) {
  const ranges = match.variant.finderAttributes!.dimensionRanges;
  return ranges.diameter
    ? `${formatMillimeters(ranges.diameter.min)}–${formatMillimeters(ranges.diameter.max)} mm`
    : `${formatMillimeters(ranges.width!.min)}–${formatMillimeters(ranges.width!.max)} × ${formatMillimeters(ranges.height!.min)}–${formatMillimeters(ranges.height!.max)} mm`;
}

function suitableFloors(match: FinderMatch) {
  const suitability = match.variant.finderAttributes!.floorSuitability;
  return allFloors
    .filter((floor) => suitability[floor] !== "unsuitable")
    .sort((left, right) => {
      const rank = { preferred: 0, compatible: 1, unsuitable: 2 } as const;
      return rank[suitability[left]] - rank[suitability[right]];
    })
    .map((floor) => floorTypeLabels[floor])
    .join(", ");
}

function emptyFinderInput(): FinderInput {
  return {
    itemType: null,
    frameShape: null,
    dimensions: {},
    floorType: null,
    itemCount: null,
    reserveEnabled: true,
  };
}

interface GliderFinderProps {
  products: CommerceProduct[];
  initialInput: FinderInput;
  initialStep: number;
}

function Choice<T extends string>({
  name,
  value,
  selected,
  label,
  description,
  onChange,
}: {
  name: string;
  value: T;
  selected: boolean;
  label: string;
  description?: string;
  onChange: (value: T) => void;
}) {
  return (
    <label className={`relative flex min-h-[4.75rem] cursor-pointer items-center rounded-2xl border px-5 py-4 transition focus-within:ring-2 focus-within:ring-premium-sand focus-within:ring-offset-2 ${selected ? "border-premium-forest bg-premium-forest text-white shadow-premium" : "border-premium-beige/90 bg-white/65 text-premium-ink hover:border-premium-leaf hover:bg-white"}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className={`h-5 w-5 shrink-0 accent-premium-forest ${selected ? "accent-white" : ""}`}
      />
      <span className="ml-4 min-w-0">
        <span className="block text-base font-semibold">{label}</span>
        {description ? (
          <span className={`mt-1 block text-sm leading-5 ${selected ? "text-white/72" : "text-premium-muted"}`}>{description}</span>
        ) : null}
      </span>
    </label>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-premium-ink">{label}</label>
      <div className="relative mt-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="5"
          max="100"
          step="0.1"
          value={value ?? ""}
          onChange={(event) => {
            const parsed = Number.parseFloat(event.target.value);
            onChange(Number.isFinite(parsed) ? parsed : undefined);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          className={`w-full rounded-2xl border bg-white px-5 py-4 pr-14 text-lg text-premium-ink outline-none transition focus:ring-2 focus:ring-premium-sand/30 ${error ? "border-red-700" : "border-premium-beige focus:border-premium-leaf"}`}
        />
        <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-sm font-semibold text-premium-muted">mm</span>
      </div>
      {error ? <p id={`${id}-error`} className="mt-2 text-sm text-red-800">{error}</p> : <p id={`${id}-hint`} className="mt-2 text-xs text-premium-subtle">Zulässiger Eingabebereich: 5 bis 100 mm.</p>}
    </div>
  );
}

function QuantitySummary({ quantity }: { quantity: FinderQuantityResult }) {
  return (
    <dl className="mt-6 divide-y divide-premium-beige/80 rounded-2xl bg-premium-warm/75 px-5 text-sm">
      <div className="flex justify-between gap-5 py-4">
        <dt>Benötigt</dt>
        <dd className="text-right font-semibold text-premium-ink">{quantity.itemCount} × {quantity.glidersPerItem} = {quantity.requiredPieces} Stück</dd>
      </div>
      <div className="flex justify-between gap-5 py-4">
        <dt>Reserve{quantity.reservePercent ? ` (${quantity.reservePercent} %)` : ""}</dt>
        <dd className="font-semibold text-premium-ink">{quantity.reservePieces} Stück</dd>
      </div>
      <div className="flex justify-between gap-5 py-4 text-base">
        <dt className="font-semibold">Empfohlen</dt>
        <dd className="font-semibold text-premium-forest">{quantity.recommendedPieces} Stück</dd>
      </div>
      {quantity.packSize !== null ? (
        <>
          <div className="flex justify-between gap-5 py-4">
            <dt>Packungsgröße</dt>
            <dd className="text-right font-semibold text-premium-ink">{quantity.packSize} Stück</dd>
          </div>
          <div className="flex justify-between gap-5 py-4">
            <dt>Bestellbar als</dt>
            <dd className="text-right font-semibold text-premium-ink">{quantity.packCount} × {quantity.packSize}</dd>
          </div>
          <div className="flex justify-between gap-5 py-4">
            <dt>Gesamt</dt>
            <dd className="text-right font-semibold text-premium-ink">{quantity.orderPieces} Stück</dd>
          </div>
        </>
      ) : null}
    </dl>
  );
}

function ProductMatch({ match, prominent = false }: { match: FinderMatch; prominent?: boolean }) {
  const { addLines, pending } = useCart();
  const attributes = match.variant.finderAttributes!;
  const glidingSurface = attributes.glidingSurface === "felt"
    ? "Filz"
    : attributes.glidingSurface === "plastic"
      ? "Kunststoff"
      : "Andere";

  return (
    <article className={prominent ? "grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12" : "rounded-[1.75rem] border border-premium-beige/80 bg-white/65 p-5 sm:p-7"}>
      <CommerceMedia
        image={match.variant.image ?? match.product.featuredImage}
        fallbackLabel={match.product.title}
        sizes={prominent ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 768px) 32vw, 100vw"}
        aspectRatio="5 / 4"
        className="rounded-[1.75rem]"
      />
      <div className={prominent ? "self-center" : "mt-6"}>
        <p className="section-eyebrow">Passende Ausführung</p>
        <h3 className="mt-3 font-display text-3xl font-medium tracking-[-0.025em] text-premium-ink">{match.product.title}</h3>
        <p className="mt-2 text-base font-semibold text-premium-forest">{match.variant.title}</p>
        {process.env.NODE_ENV === "development" && attributes.dataStatus === "development" ? (
          <p className="mt-3 inline-flex rounded-full bg-premium-sand/25 px-3 py-1 text-xs font-semibold text-premium-ink">Development-Daten</p>
        ) : null}
        <dl className="mt-6 grid gap-x-6 gap-y-4 rounded-2xl border border-premium-beige/80 bg-white/55 p-5 text-sm sm:grid-cols-2">
          <div><dt className="text-premium-subtle">Nennmaß</dt><dd className="mt-1 font-semibold text-premium-ink">{nominalDimension(match)}</dd></div>
          <div><dt className="text-premium-subtle">Passbereich</dt><dd className="mt-1 font-semibold text-premium-ink">{dimensionRange(match)}</dd></div>
          <div><dt className="text-premium-subtle">Gleitfläche</dt><dd className="mt-1 font-semibold text-premium-ink">{glidingSurface}</dd></div>
          <div><dt className="text-premium-subtle">Geeignete Böden</dt><dd className="mt-1 font-semibold leading-6 text-premium-ink">{suitableFloors(match)}</dd></div>
        </dl>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-premium-muted">
          {match.reasons.map((reason) => <li key={reason} className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-premium-bronze" /><span>{reason}</span></li>)}
        </ul>
        <QuantitySummary quantity={match.quantity} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href={`/shop/produkt/${match.product.handle}?variant=${encodeURIComponent(match.variant.id)}`} className={prominent ? "btn-secondary w-full text-center" : "btn-primary w-full text-center"}>
            Produkt ansehen
          </Link>
          {prominent && canAddVariantToCart(match.variant) ? (
            <button
              type="button"
              disabled={pending}
              data-testid="finder-add-to-cart"
              onClick={() => addLines([cartLineFromProduct({
                product: match.product,
                variant: match.variant,
                quantity: match.quantity.orderPieces,
                source: "glider_finder",
                finderContext: {
                  itemCount: match.quantity.itemCount,
                  requiredQuantity: match.quantity.requiredPieces,
                  reserveQuantity: match.quantity.reservePieces,
                  recommendedQuantity: match.quantity.recommendedPieces,
                  orderQuantity: match.quantity.orderPieces,
                },
              })])}
              className="btn-primary w-full text-center disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Wird hinzugefügt …" : "In den Warenkorb"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ResultView({ result, onEdit }: { result: FinderResult; onEdit: () => void }) {
  if (result.status === "unique") {
    return (
      <div data-testid="finder-result" data-status="unique">
        <div className="mb-9 max-w-2xl">
          <p className="section-eyebrow">Eindeutiges Ergebnis</p>
          <h2 className="section-title mt-4">Ein Gleiter passt zu Ihren Angaben.</h2>
          <p className="section-lead mt-4">{result.message}</p>
        </div>
        <ProductMatch match={result.matches[0]} prominent />
      </div>
    );
  }

  if (result.status === "multiple") {
    return (
      <div data-testid="finder-result" data-status="multiple">
        <p className="section-eyebrow">Mehrere Möglichkeiten</p>
        <h2 className="section-title mt-4">Es kommen {result.matches.length} Ausführungen infrage.</h2>
        <p className="section-lead mt-4 max-w-2xl">{result.message} Bitte vergleichen Sie die Varianten oder lassen Sie das Maß kurz prüfen.</p>
        <div className="mt-9 grid gap-6 md:grid-cols-2">{result.matches.map((match) => <ProductMatch key={match.variant.id} match={match} />)}</div>
        <p className="mt-6 text-sm leading-6 text-premium-muted">Unsicher? Muster testen oder persönlich fragen.</p>
      </div>
    );
  }

  const uncertain = result.status === "uncertain";
  return (
    <div data-testid="finder-result" data-status={result.status} className="mx-auto max-w-3xl text-center">
      <p className="section-eyebrow">{uncertain ? "Noch nicht sicher" : "Keine eindeutige Shop-Lösung"}</p>
      <h2 className="mx-auto mt-4 font-display text-3xl font-medium leading-tight text-premium-ink sm:text-4xl">{result.message}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-premium-muted">
        {uncertain ? "Prüfen Sie das Maß noch einmal oder halten Sie ein Foto des Gestells bereit. Wir helfen gern bei der Zuordnung." : "Das Sortiment soll nicht zur Sackgasse werden. Mit Foto, Außenmaß und Bodenart können wir persönlich prüfen, ob eine andere Lösung möglich ist."}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={onEdit} className="btn-secondary">Maß noch einmal prüfen</button>
        <Link href={CONTACT_HREF} className="btn-primary">Persönlich fragen</Link>
      </div>
    </div>
  );
}

function setQueryState(input: FinderInput, step: number) {
  const params = new URLSearchParams();
  if (input.itemType) params.set("art", input.itemType);
  if (input.frameShape) params.set("form", input.frameShape);
  if (input.dimensions.diameter !== undefined) params.set("d", String(input.dimensions.diameter));
  if (input.dimensions.width !== undefined) params.set("b", String(input.dimensions.width));
  if (input.dimensions.height !== undefined) params.set("h", String(input.dimensions.height));
  if (input.floorType) params.set("boden", input.floorType);
  if (input.itemCount !== null) params.set("anzahl", String(input.itemCount));
  params.set("reserve", input.reserveEnabled ? "1" : "0");
  params.set("schritt", step === 6 ? "ergebnis" : String(step));
  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
    // Use the native History method so updating the shareable finder state does
    // not trigger a new Next.js server-component navigation on every input.
    History.prototype.replaceState.call(window.history, null, "", nextUrl);
  }
}

export default function GliderFinder({ products, initialInput, initialStep }: GliderFinderProps) {
  const [input, setInput] = useState<FinderInput>(initialInput);
  const [step, setStep] = useState(initialStep);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLElement | null>(null);
  const supportedShapes = useMemo(() => {
    const set = new Set<CommerceFinderFrameShape>();
    products.forEach((product) => product.variants.forEach((variant) => {
      if (variant.finderAttributes) set.add(variant.finderAttributes.frameShape);
    }));
    return (["round", "square", "rectangular", "oval", "cantilever"] as CommerceFinderFrameShape[]).filter((shape) => set.has(shape));
  }, [products]);
  const result = useMemo(() => recommendGliders(products, input), [products, input]);

  useEffect(() => {
    if (step > 0) setQueryState(input, step);
  }, [input, step]);

  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  function update(next: Partial<FinderInput>) {
    setInput((current) => ({ ...current, ...next }));
    setError(null);
  }

  function updateDimensions(next: Partial<FinderDimensions>) {
    setInput((current) => ({ ...current, dimensions: { ...current.dimensions, ...next } }));
    setError(null);
  }

  function validateCurrentStep() {
    if (step === 1 && !input.itemType) return "Bitte wählen Sie Stuhl oder Tisch aus.";
    if (step === 2 && !input.frameShape) return "Bitte wählen Sie die Form des Gestells aus.";
    if (step === 3 && input.frameShape && input.frameShape !== "unknown") {
      for (const key of requiredDimensionKeys(input.frameShape)) {
        const value = input.dimensions[key];
        if (value === undefined) return "Bitte tragen Sie alle benötigten Außenmaße ein.";
        if (value < 5 || value > 100) return "Bitte geben Sie ein Maß zwischen 5 und 100 mm ein.";
      }
    }
    if (step === 4 && !input.floorType) return "Bitte wählen Sie den hauptsächlichen Boden aus.";
    if (step === 5 && (input.itemCount === null || !Number.isInteger(input.itemCount) || input.itemCount < 1 || input.itemCount > 10000)) return "Bitte geben Sie eine ganze Anzahl zwischen 1 und 10.000 ein.";
    return null;
  }

  function next() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep((current) => Math.min(6, current + 1));
  }

  const dimensionError = step === 3 ? error ?? undefined : undefined;

  return (
    <section className="overflow-hidden rounded-[2.25rem] border border-premium-beige/70 bg-white/55 shadow-premium-lg backdrop-blur-sm">
      {step === 0 ? (
        <div className="relative isolate grid min-h-[560px] items-end overflow-hidden bg-premium-ink px-6 py-10 text-white sm:px-10 lg:grid-cols-[1.15fr_.85fr] lg:px-14 lg:py-14">
          <div className="absolute inset-0 -z-10 [background:radial-gradient(circle_at_80%_20%,rgba(185,199,167,.24),transparent_30%),linear-gradient(140deg,#17251d,#0d1712)]" />
          <div>
            <p className="section-eyebrow text-premium-sand">DLMNS Gleiter-Finder</p>
            <h1 className="mt-5 max-w-[13ch] font-display text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">Welcher Gleiter passt?</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">Bestehende Stühle und Tische unterscheiden sich bei Rohrform, Maß und Einsatzbereich. Der Finder führt Schritt für Schritt zur passenden Lösung.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setStep(1)} className="btn-on-dark">Gleiter finden</button>
              <Link href={CONTACT_HREF} className="btn-outline-dark">Lieber persönlich klären</Link>
            </div>
          </div>
          <div className="mt-12 border-l border-white/15 pl-6 text-sm leading-7 text-white/58 lg:ml-auto lg:max-w-xs">
            <p>Halten Sie einen Zollstock oder Messschieber bereit.</p>
            <p className="mt-3">Die aktuellen Maßbereiche sind transparent gekennzeichnete Entwicklungsdaten.</p>
          </div>
        </div>
      ) : (
        <div className="px-5 py-7 sm:px-9 sm:py-10 lg:px-14 lg:py-12">
          <div className="flex items-center justify-between gap-5 border-b border-premium-beige/80 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-premium-bronze">{step === 6 ? "Ergebnis" : `${step} von 5`}</p>
              <p className="mt-1 text-sm text-premium-muted">{step === 6 ? "Ihre Auswahl" : stepNames[step - 1]}</p>
            </div>
            {step <= 5 ? <progress value={step} max={5} aria-label={`Schritt ${step} von 5`} className="h-1.5 w-28 overflow-hidden rounded-full accent-premium-forest sm:w-44" /> : null}
          </div>

          <div className="mx-auto min-h-[480px] max-w-4xl py-9 sm:py-12">
            {step === 1 ? (
              <fieldset>
                <legend ref={(node) => { headingRef.current = node; }} tabIndex={-1} className="section-title-functional outline-none">Wofür wird der Gleiter benötigt?</legend>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {(["chair", "table"] as CommerceFinderItemType[]).map((value) => <Choice key={value} name="item-type" value={value} selected={input.itemType === value} label={itemTypeLabels[value]} onChange={(itemType) => update({ itemType })} />)}
                </div>
              </fieldset>
            ) : null}

            {step === 2 ? (
              <fieldset>
                <legend ref={(node) => { headingRef.current = node; }} tabIndex={-1} className="section-title-functional outline-none">Welche Form hat das Gestell?</legend>
                <p className="mt-3 text-sm leading-6 text-premium-muted">Wählen Sie die Form des Rohres an der Stelle, an der der Gleiter sitzt.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {supportedShapes.map((value) => <Choice key={value} name="frame-shape" value={value} selected={input.frameShape === value} label={frameShapeLabels[value]} onChange={(frameShape) => update({ frameShape, dimensions: {} })} />)}
                  <Choice name="frame-shape" value="unknown" selected={input.frameShape === "unknown"} label="Weiß nicht" description="Wir führen ohne sichere Empfehlung zur Beratung." onChange={(frameShape: FinderFrameShape) => update({ frameShape, dimensions: {} })} />
                </div>
              </fieldset>
            ) : null}

            {step === 3 ? (
              <div>
                <h2 ref={(node) => { headingRef.current = node; }} tabIndex={-1} className="section-title-functional outline-none">{input.frameShape === "round" ? "Wie groß ist der Außendurchmesser?" : input.frameShape === "unknown" ? "Form nicht sicher?" : "Wie breit und hoch ist das Rohr?"}</h2>
                {input.frameShape === "unknown" ? (
                  <div className="mt-7 rounded-[1.75rem] bg-premium-warm/80 p-6 sm:p-8"><p className="text-base leading-7 text-premium-muted">Ohne erkennbare Gestellform geben wir keine Produktempfehlung vor. Sie können trotzdem fortfahren und direkt die nächsten sinnvollen Schritte erhalten.</p></div>
                ) : input.frameShape ? (
                  <>
                    <div className="mt-7"><MeasurementGuide shape={input.frameShape} /></div>
                    <div className={`mt-7 grid gap-5 ${input.frameShape === "round" ? "max-w-sm" : "sm:grid-cols-2"}`}>
                      {input.frameShape === "round" ? <NumberField id="diameter" label="Durchmesser" value={input.dimensions.diameter} onChange={(diameter) => updateDimensions({ diameter })} error={dimensionError} /> : <><NumberField id="width" label="Breite" value={input.dimensions.width} onChange={(width) => updateDimensions({ width })} error={dimensionError} /><NumberField id="height" label="Höhe" value={input.dimensions.height} onChange={(height) => updateDimensions({ height })} error={dimensionError} /></>}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}

            {step === 4 ? (
              <fieldset>
                <legend ref={(node) => { headingRef.current = node; }} tabIndex={-1} className="section-title-functional outline-none">Auf welchem Boden wird {input.itemType === "table" ? "der Tisch" : "der Stuhl"} hauptsächlich genutzt?</legend>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {allFloors.map((value) => <Choice key={value} name="floor-type" value={value} selected={input.floorType === value} label={floorTypeLabels[value]} onChange={(floorType) => update({ floorType })} />)}
                  <Choice name="floor-type" value="unknown" selected={input.floorType === "unknown"} label="Weiß nicht" description="Dann empfehlen wir eine persönliche Prüfung." onChange={(floorType: FinderFloorType) => update({ floorType })} />
                </div>
              </fieldset>
            ) : null}

            {step === 5 ? (
              <div>
                <h2 ref={(node) => { headingRef.current = node; }} tabIndex={-1} className="section-title-functional outline-none">Wie viele {input.itemType === "table" ? "Tische" : "Stühle"} sollen ausgestattet werden?</h2>
                <div className="mt-8 max-w-lg">
                  <label htmlFor="item-count" className="text-sm font-semibold text-premium-ink">Anzahl {input.itemType === "table" ? "Tische" : "Stühle"}</label>
                  <input id="item-count" type="number" inputMode="numeric" min="1" max="10000" step="1" value={input.itemCount ?? ""} onChange={(event) => update({ itemCount: event.target.value ? Number(event.target.value) : null })} aria-invalid={Boolean(error)} aria-describedby={error ? "finder-error" : undefined} className={`mt-2 w-full rounded-2xl border bg-white px-5 py-4 text-lg text-premium-ink outline-none transition focus:ring-2 focus:ring-premium-sand/30 ${error ? "border-red-700" : "border-premium-beige focus:border-premium-leaf"}`} />
                  <label className="mt-5 flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl bg-premium-warm/80 px-5 py-4">
                    <input type="checkbox" checked={input.reserveEnabled} onChange={(event) => update({ reserveEnabled: event.target.checked })} className="h-5 w-5 accent-premium-forest" />
                    <span><span className="block text-sm font-semibold text-premium-ink">5 % Reserve einplanen</span><span className="mt-1 block text-xs leading-5 text-premium-muted">Optional und jederzeit abwählbar.</span></span>
                  </label>
                </div>
              </div>
            ) : null}

            {step === 6 ? <ResultView result={result} onEdit={() => setStep(3)} /> : null}

            {error && step !== 3 ? <p id="finder-error" role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-premium-beige/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} className="btn-secondary px-6">Zurück</button>
            {step < 6 ? <button type="button" onClick={next} className="btn-primary px-8">{step === 5 ? "Empfehlung anzeigen" : "Weiter"}</button> : <div className="flex flex-col gap-3 sm:flex-row"><Link href={CONTACT_HREF} className="btn-secondary px-6">Unsicher? Persönlich fragen</Link><button type="button" onClick={() => { setInput(emptyFinderInput()); setStep(1); }} className="btn-primary px-6">Neu beginnen</button></div>}
          </div>
          <p className="sr-only" aria-live="polite">{step === 6 ? `Ergebnis: ${result.message}` : `Schritt ${step} von 5: ${stepNames[step - 1]}`}</p>
        </div>
      )}
    </section>
  );
}
