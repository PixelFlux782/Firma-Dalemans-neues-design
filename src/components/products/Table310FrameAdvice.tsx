import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";

const frameImage = (fileName: string) => encodeURI(`/neue bilder/Gestelle/Gestelltypen/${fileName}`);
const tableImage = (fileName: string) => encodeURI(`/neue bilder/Tische/klapptisch-310c/${fileName}`);

const mechanismImages = [
  {
    src: tableImage("310c-04-eingeklappt.webp"),
    alt: "Unterseite des Klapptischs 310c mit eingeklapptem Gestell K1",
    caption: "K1 eingeklappt: Das Gestell liegt kompakt unter der Tischplatte.",
  },
  {
    src: tableImage("310c-05-klappmechanik.webp"),
    alt: "Klappmechanik des Gestells K1 am Klapptisch 310c",
    caption: "Klappmechanik K1: Gestell und Verriegelung in der Unteransicht.",
  },
  {
    src: tableImage("310c-06-beschlag-detail.webp"),
    alt: "Beschlagdetail der Klappmechanik von Gestell K1 am Klapptisch 310c",
    caption: "Beschlagdetail K1: Nahansicht der mechanischen Verbindung.",
  },
] as const;

function FrameVisual({ src, alt, label }: { src: string; alt: string; label: string }) {
  return <figure className="overflow-hidden rounded-[1.5rem] border border-premium-beige/70 bg-white/75 p-3">
    <ProductVisual src={src} alt={alt} sizes="(min-width: 1024px) 18vw, (min-width: 640px) 36vw, 100vw" aspectRatio="4 / 3" imageInset="4%" fadeStrength="soft" backgroundTone="warm" imageClassName="object-contain" />
    <figcaption className="px-2 pb-2 pt-3 text-sm font-semibold text-premium-ink">{label}</figcaption>
  </figure>;
}

export default function Table310FrameAdvice() {
  return <section id="gestellberatung" aria-labelledby="table-310-frame-title" className="scroll-mt-28 space-y-9">
    <div className="max-w-3xl">
      <p className="section-eyebrow">Gestellberatung Modell 310c</p>
      <h2 id="table-310-frame-title" className="section-title mt-4">Das passende Gestell für Ihren Tisch.</h2>
      <p className="mt-5 text-lg leading-8 text-premium-charcoal">Wir wählen die Gestellform danach aus, ob Sie den Klapptisch 310c überwiegend in langen Reihen oder einzeln mit genutzten Stirnseiten aufstellen.</p>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-[2rem] bg-premium-warm/75 p-6 sm:p-8" aria-labelledby="table-310-row-frames">
        <p className="section-eyebrow">Für Tischreihen</p>
        <h3 id="table-310-row-frames" className="mt-3 font-display text-3xl font-medium text-premium-ink">Gestelle K1 und K2</h3>
        <p className="mt-5 text-sm leading-7 text-premium-muted">Bei langen Tischreihen kommt es besonders auf die Beinfreiheit an den Tischstößen an. Durch die leicht zurückversetzten vertikalen Gestellrohre bieten K1 und K2 mehr Bewegungsfreiheit zwischen benachbarten Tischen.</p>
        <p className="mt-3 text-sm leading-7 text-premium-muted">Ideal für Konferenzen, Seminare und größere Veranstaltungen.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FrameVisual src={frameImage("Klapptisch_Gestell_K1-optimiert.webp")} alt="Klapptisch-Gestell K1 mit zurückversetzten vertikalen Rohren für Tischreihen" label="Gestell K1" />
          <FrameVisual src={frameImage("Klapptisch_Gestell_K2-optimiert.webp")} alt="Klapptisch-Gestell K2 mit zurückversetzten vertikalen Rohren für Tischreihen" label="Gestell K2" />
        </div>
      </article>

      <article className="rounded-[2rem] border border-premium-beige/80 p-6 sm:p-8" aria-labelledby="table-310-single-frames">
        <p className="section-eyebrow">Für einzeln aufgestellte Tische</p>
        <h3 id="table-310-single-frames" className="mt-3 font-display text-3xl font-medium text-premium-ink">Gestelle K3 und K4</h3>
        <p className="mt-5 text-sm leading-7 text-premium-muted">Wenn Tische einzeln stehen und auch die Stirnseiten als Sitzplätze genutzt werden, sind K3 und K4 besonders geeignet. Ihre Konstruktion bietet mehr Beinfreiheit an den Tischenden.</p>
        <p className="mt-3 text-sm leading-7 text-premium-muted">Diese Gestellvarianten sind laut vorliegender Produktinformation ohne Aufpreis erhältlich.</p>
        <div className="mt-6 max-w-sm">
          <FrameVisual src={frameImage("T_Klapptisch_Gestell_K3_Standard-optimiert.webp")} alt="Klapptisch-Gestell K3 für mehr Beinfreiheit an den Stirnseiten" label="Gestell K3" />
        </div>
        <p className="mt-4 text-xs leading-6 text-premium-muted">Abgebildet ist K3. Für K4 liegt uns kein eindeutig zugeordnetes Produktbild vor.</p>
      </article>
    </div>

    <aside className="rounded-[2rem] bg-premium-ink px-7 py-8 text-white sm:px-9" aria-labelledby="table-310-recommendation">
      <p className="section-eyebrow text-premium-sand">Unsere Empfehlung</p>
      <h3 id="table-310-recommendation" className="mt-3 font-display text-2xl font-medium text-white">K1 für 140 cm lange Tische.</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">Bei Tischen mit 140 cm Länge ist K1 eine bewährte Wahl und bietet einen guten Kompromiss zwischen Stabilität und Beinfreiheit. Die endgültige Gestellwahl stimmen wir mit Ihrer geplanten Aufstellung und Stirnseitennutzung ab.</p>
    </aside>

    <div aria-labelledby="table-310-mechanism-title">
      <p className="section-eyebrow">Mechanik im Detail</p>
      <h3 id="table-310-mechanism-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">Klappmechanik des Gestells K1.</h3>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {mechanismImages.map((item) => <figure key={item.src} className="overflow-hidden rounded-[1.5rem] border border-premium-beige/80 bg-premium-warm/55 p-3">
          <ProductVisual src={item.src} alt={item.alt} sizes="(min-width: 768px) 30vw, 100vw" aspectRatio="4 / 3" imageInset="3%" fadeStrength="soft" backgroundTone="warm" imageClassName="object-contain" />
          <figcaption className="px-3 pb-3 pt-4 text-sm leading-6 text-premium-muted">{item.caption}</figcaption>
        </figure>)}
      </div>
    </div>

    <div className="flex flex-wrap gap-3">
      <Link href="/wissen/klapptische-richtig-waehlen#gestelle" className="btn-primary">Gestellratgeber lesen</Link>
      <Link href="/kontakt?anliegen=Tischgestellberatung" className="btn-secondary">Gestellwahl persönlich abstimmen</Link>
    </div>
  </section>;
}
