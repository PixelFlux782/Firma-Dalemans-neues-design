import Image from "next/image";
import Link from "next/link";
import stackingChairsImage from "../../../public/neue bilder/Stapelstühle/Stapelstuhl_Stahlrohr_1021c_03.png";
import foldingTableImage from "../../../public/neue bilder/Tische/t210_01.png";
import lecternImage from "../../../public/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA_1.png";
import accessoriesImage from "../../../public/neue bilder/Zubehör/Tischtransportwagen_03.png";

const primaryCategories = [
  {
    title: "Stapelstühle",
    description: "Flexible Bestuhlung für Räume, die sich verändern.",
    href: "/produkte/stapelstuehle",
    image: stackingChairsImage,
    alt: "Mehrere gepolsterte Stapelstühle mit Holzschale und Stahlrohrgestell",
  },
  {
    title: "Klapptische",
    description: "Vielseitige Tischlösungen für flexible Raumnutzung.",
    href: "/produkte/sortiment/klapptische",
    image: foldingTableImage,
    alt: "Klapptisch mit heller Tischplatte und verchromtem Stahlrohrgestell",
  },
] as const;

const complementaryCategories = [
  {
    title: "Rednerpulte",
    description: "Klare Lösungen für Vorträge und Veranstaltungen.",
    href: "/produkte/sortiment/rednerpulte",
    image: lecternImage,
    alt: "Transparentes Rednerpult aus Acrylglas, Typ A",
    imageFit: "contain",
  },
  {
    title: "Zubehör & Transport",
    description:
      "Praktische Ergänzungen für Transport, Lagerung und langfristige Nutzung.",
    href: "/produkte/kategorien/transportwagen-zubehoer",
    image: accessoriesImage,
    alt: "Tischtransportwagen mit gestapelten Tischen und Zubehörteilen",
    imageFit: "cover",
  },
] as const;

function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 text-xl font-light leading-none text-premium-bronze transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1"
    >
      →
    </span>
  );
}

export default function HomeProductRange() {
  return (
    <section aria-labelledby="home-range-heading" className="section-depth">
      <div className="grid gap-7 border-b border-premium-beige/80 pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12 md:pb-10">
        <div className="max-w-2xl">
          <p className="section-eyebrow">Unser Sortiment</p>
          <h2
            id="home-range-heading"
            className="mt-4 max-w-[13ch] font-display text-[2.15rem] font-medium leading-[1.08] tracking-[-0.025em] text-premium-ink sm:text-[2.65rem]"
          >
            Für Räume, die<br className="hidden sm:block" /> sich verändern.
          </h2>
          <p className="mt-5 max-w-xl text-[0.95rem] leading-7 text-premium-muted sm:text-base">
            Stapelstühle, Klapptische und durchdachte Ergänzungen für flexible
            Raumkonzepte.
          </p>
        </div>
        <Link
          href="/produkte"
          className="group inline-flex min-h-11 w-fit items-center gap-2 pb-1 text-sm font-medium tracking-wide text-premium-charcoal underline-offset-4 transition-colors duration-300 hover:text-premium-bronze hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-forest focus-visible:ring-offset-4"
        >
          Alle Produkte
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1">→</span>
        </Link>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:gap-10">
        {primaryCategories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            aria-label={`${category.title}: ${category.description}`}
            className="group block min-w-0 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-forest focus-visible:ring-offset-4"
          >
            <article>
              <div className="relative aspect-[3/2] overflow-hidden bg-premium-warm">
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(min-width: 1280px) 584px, (min-width: 768px) calc(50vw - 40px), calc(100vw - 40px)"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
                />
              </div>
              <div className="flex items-start justify-between gap-6 border-b border-premium-beige/80 py-5 sm:py-6">
                <div>
                  <h3 className="font-display text-[1.7rem] font-medium leading-tight tracking-[-0.02em] text-premium-ink sm:text-[1.9rem]">
                    {category.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-premium-muted sm:text-[0.95rem] sm:leading-7">
                    {category.description}
                  </p>
                </div>
                <Arrow />
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-12 lg:gap-8">
        {complementaryCategories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            aria-label={`${category.title}: ${category.description}`}
            className="group block min-w-0 overflow-hidden border-y border-premium-beige/80 bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-forest focus-visible:ring-offset-4"
          >
            <article className="grid grid-cols-1 sm:min-h-[15rem] sm:grid-cols-[44%_minmax(0,1fr)]">
              <div className="relative aspect-[3/2] overflow-hidden bg-premium-warm sm:aspect-auto sm:min-h-full">
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(min-width: 1280px) 255px, (min-width: 640px) 22vw, calc(100vw - 40px)"
                  className={`${category.imageFit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-300 ease-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02]`}
                />
              </div>
              <div className="flex min-w-0 flex-col justify-between p-5 sm:p-6 lg:p-7">
                <div>
                  <h3 className="font-display text-[1.35rem] font-medium leading-tight tracking-[-0.015em] text-premium-ink sm:text-2xl">
                    {category.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-premium-muted">
                    {category.description}
                  </p>
                </div>
                <div className="mt-5 flex justify-end">
                  <Arrow />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
