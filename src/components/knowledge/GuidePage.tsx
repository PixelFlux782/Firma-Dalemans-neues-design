import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CtaBanner from "@/components/ui/CtaBanner";
import { StructuredData } from "@/components/StructuredData";
import CommerceProductCard from "@/components/commerce/CommerceProductCard";
import { getProducts } from "@/lib/commerce/service";
import type { GuideArticle } from "@/lib/knowledge";
import { regulatory } from "@/lib/knowledge/advisory-facts";
import { getGuideIntegration } from "@/lib/knowledge/advisory-integration";
import { absoluteUrl, siteName } from "@/lib/seo";

export default async function GuidePage({ article }: { article: GuideArticle }) {
  const path = `/wissen/${article.slug}`;
  const integration = getGuideIntegration(article.slug);
  const allProducts = integration ? await getProducts() : [];
  const productHandles: readonly string[] = integration?.productHandles ?? [];
  const relevantProducts = productHandles
    .map((handle) => allProducts.find((product) => product.handle === handle))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const date = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(`${article.updatedAt}T12:00:00+02:00`));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    dateModified: article.updatedAt,
    mainEntityOfPage: absoluteUrl(path),
    author: { "@type": "Organization", name: siteName },
    publisher: { "@type": "Organization", name: siteName },
  };
  const faqData = article.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  return (
    <article className="page-stack">
      <StructuredData data={structuredData} />
      {faqData ? <StructuredData data={faqData} /> : null}

      <header className="relative overflow-hidden rounded-5xl bg-premium-forest px-7 py-9 text-white shadow-premium-xl sm:px-9 md:px-12 md:py-14 lg:px-16 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_85%_0%,rgba(201,213,191,.2),transparent_65%)]" aria-hidden />
        <div className="relative">
          <Breadcrumbs
            currentPath={path}
            items={[{ label: "Start", href: "/" }, { label: "Wissen", href: "/wissen" }, { label: article.title }]}
            className="text-white/65 [&_[aria-current=page]]:text-white"
          />
          <p className="section-eyebrow mt-10 text-premium-sand">{article.category}</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">{article.description}</p>
          <p className="mt-7 text-xs font-medium uppercase tracking-[0.16em] text-white/55">Fachlich geprüft · aktualisiert am {date}</p>
        </div>
      </header>

      <div className="grid min-w-0 gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <div className="min-w-0 space-y-12">
          {article.body.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 border-t border-premium-beige/80 pt-9 first:border-t-0 first:pt-0">
              <h2 className="max-w-3xl font-display text-2xl font-medium leading-tight text-premium-ink md:text-3xl">{section.heading}</h2>
              <div className="mt-5 space-y-4">
                {section.paragraphs.map((paragraph) => <p key={paragraph} className="max-w-3xl text-base leading-8 text-premium-muted">{paragraph}</p>)}
              </div>
              {section.list?.length ? (
                <ul className="mt-6 grid gap-3 text-sm leading-7 text-premium-muted">
                  {section.list.map((item) => <li key={item} className="flex gap-3"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-premium-leaf" aria-hidden />{item}</li>)}
                </ul>
              ) : null}
              {section.facts?.length ? (
                <dl className="mt-7 grid gap-3 sm:grid-cols-2" aria-label={`${section.heading}: Übersicht`}>
                  {section.facts.map((fact) => (
                    <div key={`${fact.label}-${fact.value}`} className="min-w-0 rounded-2xl border border-premium-beige/70 bg-premium-warm/55 p-5">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-premium-subtle">{fact.label}</dt>
                      <dd className="mt-2 font-display text-xl font-medium text-premium-ink">{fact.value}</dd>
                      {fact.note ? <p className="mt-2 text-sm leading-6 text-premium-muted">{fact.note}</p> : null}
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
          ))}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start" aria-label="Artikelübersicht und Beratung">
          <div className="rounded-3xl border border-premium-beige/70 bg-white/70 p-6 shadow-premium">
            <p className="section-eyebrow">In diesem Ratgeber</p>
            <nav className="mt-4" aria-label="Inhaltsverzeichnis">
              <ol className="grid gap-1">
                {article.body.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="flex min-h-11 gap-3 rounded-lg px-2 py-2 text-sm leading-6 text-premium-muted transition hover:bg-premium-warm hover:text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                      <span className="text-premium-bronze">{String(index + 1).padStart(2, "0")}</span><span>{section.heading}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <Link href={`/kontakt?anliegen=${encodeURIComponent(`Beratung zu ${article.title}`)}`} className="btn-primary mt-5 w-full text-center">Persönlich beraten lassen</Link>
        </aside>
      </div>

      <section aria-labelledby="guide-faq" className="mx-auto w-full max-w-4xl">
        <p className="section-eyebrow">Häufige Fragen</p>
        <h2 id="guide-faq" className="section-title mt-4">Kurz und konkret beantwortet.</h2>
        <div className="mt-8 divide-y divide-premium-beige/80 border-y border-premium-beige/80">
          {article.faq.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 font-semibold text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                {item.question}<span aria-hidden className="text-premium-bronze transition group-open:rotate-45">＋</span>
              </summary>
              <p className="max-w-3xl pb-2 pt-4 text-sm leading-7 text-premium-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {relevantProducts.length ? (
        <section aria-labelledby="guide-products">
          <p className="section-eyebrow">Passende Produkte</p>
          <h2 id="guide-products" className="section-title mt-4">Aus dem Wissen direkt zur Auswahl.</h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-premium-muted">Die Auswahl zeigt vorhandene Produkte, die zum Thema passen. Welche Ausführung konkret geeignet ist, hängt von Raum, Nutzung und den verfügbaren Varianten ab.</p>
          <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {relevantProducts.map((product, index) => <CommerceProductCard key={product.id} product={product} priority={index === 0} />)}
          </div>
        </section>
      ) : null}

      {integration ? (
        <section className={`grid overflow-hidden rounded-[2rem] ${integration.roomPlanner ? "lg:grid-cols-2" : "lg:grid-cols-[1fr_auto]"}`} aria-label="Planung und persönliche Beratung">
          {integration.roomPlanner ? (
            <div className="bg-premium-ink px-7 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
              <p className="section-eyebrow text-premium-sand">Raumplaner</p>
              <h2 className="mt-4 font-display text-3xl font-medium text-white">{integration.roomPlanner.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/70">{integration.roomPlanner.description}</p>
              <p className="mt-3 text-xs leading-6 text-white/55">{regulatory.planningScope}</p>
              <Link href="/raumplaner" className="btn-dark-primary mt-7">Raumplaner öffnen</Link>
            </div>
          ) : null}
          <div className="flex flex-col justify-center bg-premium-warm/80 px-7 py-10 sm:px-10 lg:px-12 lg:py-12">
            <p className="section-eyebrow">Wenn die Auswahl offen bleibt</p>
            <h2 className="mt-4 font-display text-3xl font-medium text-premium-ink">Persönlich passend eingrenzen.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-premium-muted">{integration.consultation.description}</p>
            <Link href={`/kontakt?anliegen=${encodeURIComponent(integration.consultation.concern)}`} className="btn-primary mt-7 w-fit">Beratung anfragen</Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="related-guides">
        <p className="section-eyebrow">Passend dazu</p>
        <h2 id="related-guides" className="section-title mt-4">Weiter planen und auswählen.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {article.relatedLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group rounded-3xl border border-premium-beige/70 bg-white/70 p-6 shadow-[0_8px_28px_rgba(20,18,16,.04)] transition hover:-translate-y-0.5 hover:border-premium-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
              <h3 className="font-display text-xl font-medium text-premium-ink">{link.label}</h3>
              <p className="mt-3 text-sm leading-7 text-premium-muted">{link.description}</p>
              <span className="mt-5 inline-flex text-sm font-semibold text-premium-forest">Weiter <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden>→</span></span>
            </Link>
          ))}
        </div>
      </section>

      <CtaBanner
        eyebrow={article.slug === "stoffe-und-bezuege" ? "Stoff- und Materialberatung" : "Persönliche Beratung"}
        title={article.slug === "stoffe-und-bezuege" ? "Farbe, Haptik und Nachweise am konkreten Stoff prüfen." : "Die passende Ausführung gemeinsam eingrenzen."}
        lead={article.slug === "stoffe-und-bezuege" ? "Wir senden Ihnen Stoffmuster und prüfen mit Ihnen die Anforderungen Ihres Raums." : "Wir beraten zu Nutzung, Raum, Oberfläche und den aktuell verfügbaren Ausführungen."}
        primaryHref={article.slug === "stoffe-und-bezuege" ? "/kontakt?anliegen=Stoffmuster" : "/kontakt?anliegen=Beratung"}
        primaryLabel={article.slug === "stoffe-und-bezuege" ? "Stoffmuster anfragen" : "Persönlich beraten lassen"}
        secondaryHref="/wissen"
        secondaryLabel="Alle Themen"
      />
    </article>
  );
}
