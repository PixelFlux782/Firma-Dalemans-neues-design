"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { recordChairAction } from "@/lib/analytics";
import { formatCommerceMoney } from "@/lib/commerce/money";
import type { CommerceMoney } from "@/lib/commerce/types";

export interface ChairComparisonItem {
  handle: string;
  modelCode: string;
  fromPrice: CommerceMoney | null;
}

export default function ChairComparison({ models }: { models: ChairComparisonItem[] }) {
  const [selected, setSelected] = useState(() => models.slice(0, 2).map((model) => model.handle));
  const compared = useMemo(
    () => models.filter((model) => selected.includes(model.handle)),
    [models, selected],
  );

  function toggle(handle: string) {
    const next = selected.includes(handle)
      ? selected.filter((entry) => entry !== handle)
      : selected.length < 3
        ? [...selected, handle]
        : selected;
    setSelected(next);
    recordChairAction({
      action: "chair_compare",
      comparedModels: models.filter((model) => next.includes(model.handle)).map((model) => model.modelCode),
    });
  }

  return (
    <section aria-labelledby="comparison-heading" className="border-y border-premium-beige/80 py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-14">
        <div>
          <p className="section-eyebrow">Modellvergleich</p>
          <h2 id="comparison-heading" className="section-title-functional mt-4">Modelle nebeneinander einordnen.</h2>
          <p className="mt-4 text-sm leading-7 text-premium-muted">
            Wählen Sie bis zu drei Modelle. Weitere technische Vergleichswerte erscheinen erst, wenn sie verlässlich vorliegen.
          </p>
          <fieldset className="mt-6">
            <legend className="sr-only">Modelle für den Vergleich auswählen</legend>
            <div className="flex flex-wrap gap-2">
              {models.map((model) => {
                const active = selected.includes(model.handle);
                const disabled = !active && selected.length >= 3;
                return (
                  <button
                    key={model.handle}
                    type="button"
                    aria-pressed={active}
                    disabled={disabled}
                    onClick={() => toggle(model.handle)}
                    className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${active ? "border-premium-forest bg-premium-forest text-white" : "border-premium-beige bg-white/65 text-premium-charcoal hover:border-premium-leaf"}`}
                  >
                    <span aria-hidden className="mr-1.5">{active ? "✓" : "+"}</span>
                    {model.modelCode}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <p className="mt-3 text-xs text-premium-subtle" aria-live="polite">
            {selected.length} von maximal 3 Modellen ausgewählt
          </p>
        </div>

        {compared.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="chair-comparison">
            {compared.map((model) => (
              <article key={model.handle} className="border-l border-premium-beige/80 pl-5">
                <h3 className="font-display text-2xl font-medium text-premium-ink">{model.modelCode}</h3>
                <dl className="mt-5 divide-y divide-premium-beige/70 border-y border-premium-beige/70 text-sm">
                  <div className="py-3">
                    <dt className="text-xs uppercase tracking-[.14em] text-premium-subtle">Preis ab</dt>
                    <dd className="mt-1 font-semibold tabular-nums text-premium-forest">
                      {model.fromPrice ? formatCommerceMoney(model.fromPrice) : "Auf Anfrage"}
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-xs uppercase tracking-[.14em] text-premium-subtle">Polsterung</dt>
                    <dd className="mt-1 leading-6 text-premium-muted">ungepolstert · Sitz · Sitz + Rücken</dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-xs uppercase tracking-[.14em] text-premium-subtle">Reihenverbindung</dt>
                    <dd className="mt-1 text-premium-muted">verfügbar</dd>
                  </div>
                </dl>
                <Link href={`/produkte/stapelstuehle/${model.handle}`} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                  Modell öffnen →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="self-center text-sm leading-7 text-premium-muted">Wählen Sie mindestens ein Modell für den Vergleich.</p>
        )}
      </div>
    </section>
  );
}
