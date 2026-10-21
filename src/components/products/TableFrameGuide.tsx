import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";

const frameImage = (fileName: string) => encodeURI(`/neue bilder/Gestelle/Gestelltypen/${fileName}`);

const rowFrames = [
  {
    model: "K1",
    src: frameImage("Klapptisch_Gestell_K1-optimiert.webp"),
    alt: "Klapptisch-Gestell K1 mit zurückgesetzten vertikalen Rundrohren für Reihenaufstellungen",
  },
  {
    model: "K2",
    src: frameImage("Klapptisch_Gestell_K2-optimiert.webp"),
    alt: "Klapptisch-Gestell K2 mit zurückgesetzten vertikalen Vierkantrohren für Reihenaufstellungen",
  },
] as const;

const singleFrame = {
  model: "K3",
  src: frameImage("T_Klapptisch_Gestell_K3_Standard-optimiert.webp"),
  alt: "Klapptisch-Gestell K3 mit außenliegenden Beinen für mehr Beinfreiheit an den Stirnseiten",
} as const;

const furtherFrames = [
  { model: "K5", file: "Klapptisch_Gestell_K5-optimiert.webp" },
  { model: "K9", file: "Klapptisch_Gestell_K9-optimiert.webp" },
  { model: "K10", file: "Klapptisch_Gestell_K10-optimiert.webp" },
] as const;

function FrameCard({ model, src, alt }: { model: string; src: string; alt: string }) {
  return <figure className="overflow-hidden rounded-[1.75rem] border border-premium-beige/70 bg-white/70 p-3 shadow-[0_8px_28px_rgba(20,18,16,.04)]">
    <ProductVisual src={src} alt={alt} sizes="(min-width: 1024px) 28vw, (min-width: 640px) 44vw, 100vw" aspectRatio="1 / 1" imageInset="3%" fadeStrength="soft" backgroundTone="warm" imageClassName="object-contain" />
    <figcaption className="px-3 pb-3 pt-4">
      <h4 className="font-display text-2xl font-medium text-premium-ink">Gestell {model}</h4>
      <span className="mt-1 block text-sm leading-6 text-premium-muted">{alt}</span>
    </figcaption>
  </figure>;
}

export default function TableFrameGuide() {
  return <section aria-labelledby="table-frame-guide-title" className="space-y-12">
    <div className="max-w-3xl">
      <p className="section-eyebrow">Gestellberatung</p>
      <h2 id="table-frame-guide-title" className="section-title mt-4">Das passende Gestell für Ihren Tisch.</h2>
      <p className="mt-5 text-lg leading-8 text-premium-charcoal">Neben den Maßen spielt auch das Tischgestell eine wichtige Rolle. Welches Gestell wir empfehlen, richtet sich vor allem nach der geplanten Nutzung und Aufstellung.</p>
    </div>

    <article className="rounded-[2rem] bg-premium-warm/70 p-6 sm:p-8 lg:p-10" aria-labelledby="row-frames-title">
      <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
        <div>
          <p className="section-eyebrow">Reihenaufstellung</p>
          <h3 id="row-frames-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">K1 oder K2 für lange Tischreihen.</h3>
          <p className="mt-5 text-base leading-8 text-premium-muted">Für lange Reihenaufstellungen empfehlen wir in der Regel unsere Modelle K1 oder K2. Ihre vertikalen Rohre sind leicht zurückgesetzt. Dadurch werden Personen an den Tischstößen möglichst wenig gestört.</p>
          <p className="mt-4 text-base leading-8 text-premium-muted">Diese Gestelle eignen sich besonders für Konferenzen, Seminare und Veranstaltungen mit vielen Teilnehmern.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {rowFrames.map((frame) => <FrameCard key={frame.model} {...frame} />)}
        </div>
      </div>
    </article>

    <article className="rounded-[2rem] border border-premium-beige/80 p-6 sm:p-8 lg:p-10" aria-labelledby="single-frames-title">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <FrameCard {...singleFrame} />
        <div>
          <p className="section-eyebrow">Einzelaufstellung &amp; Stirnseiten</p>
          <h3 id="single-frames-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">K3 oder K4 für mehr Beinfreiheit.</h3>
          <p className="mt-5 text-base leading-8 text-premium-muted">Wenn Tische überwiegend einzeln genutzt werden oder regelmäßig Sitzplätze an den Stirnseiten vorgesehen sind, empfehlen wir die Modelle K3 oder K4. Diese Gestellformen bieten an den Stirnseiten mehr Beinfreiheit.</p>
          <p className="mt-4 text-base leading-8 text-premium-muted">K3 und K4 sind ohne Aufpreis erhältlich. Die gewünschte Ausführung können Sie bei der Bestellung angeben. Wir prüfen zusätzlich, welches Gestell für das gewählte Tischmodell und die geplante Nutzung verfügbar und geeignet ist.</p>
          <p className="mt-4 rounded-2xl bg-premium-warm/70 px-5 py-4 text-sm leading-7 text-premium-muted">Abgebildet ist ausschließlich das Gestell K3. Da uns kein eindeutiges freigestelltes Einzelbild von K4 vorliegt, zeigen wir K4 bewusst nicht mit einer anderen Gestellabbildung.</p>
        </div>
      </div>
    </article>

    <div aria-labelledby="further-frames-title">
      <div className="max-w-3xl">
        <p className="section-eyebrow">Weitere Gestellvarianten</p>
        <h3 id="further-frames-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">K5, K9 und K10 im Überblick.</h3>
        <p className="mt-4 text-sm leading-7 text-premium-muted">Welche dieser Ausführungen für ein konkretes Tischmodell verfügbar und geeignet ist, prüfen wir projektbezogen. Aus den Abbildungen leiten wir keine pauschale Kompatibilität ab.</p>
      </div>
      <div role="region" aria-label="Weitere Gestellvarianten K5, K9 und K10" tabIndex={0} className="gallery-rail -mx-5 mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {furtherFrames.map(({ model, file }) => <FrameCard key={model} model={model} src={frameImage(file)} alt={`Klapptisch-Gestell ${model} als weitere Gestellvariante`} />)}
      </div>
    </div>

    <div className="flex flex-col gap-4 rounded-[2rem] bg-premium-ink px-7 py-9 text-white sm:flex-row sm:items-center sm:justify-between sm:px-9">
      <div className="max-w-2xl"><p className="section-eyebrow text-premium-sand">Nächster Schritt</p><h3 className="mt-3 font-display text-2xl font-medium text-white">Aufstellung und Tischmodell gemeinsam prüfen.</h3></div>
      <div className="flex flex-wrap gap-3"><Link href="/wissen/klapptische-richtig-waehlen#gestelle" className="btn-dark-primary">Gestellratgeber lesen</Link><Link href="/kontakt?anliegen=Tischgestellberatung" className="btn-dark-secondary">Persönlich beraten lassen</Link></div>
    </div>
  </section>;
}
