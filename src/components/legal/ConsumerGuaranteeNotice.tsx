import Image from "next/image";

export default function ConsumerGuaranteeNotice() {
  return (
    <section aria-label="Gesetzliche Gewährleistung für Verbraucher" className="mt-6 rounded-2xl border border-premium-beige bg-white p-4 sm:p-6">
      <h2 className="font-semibold text-premium-ink">Gesetzliche Gewährleistung für Verbraucher</h2>
      <p className="mt-3 text-sm leading-6 text-premium-muted">Bei mangelhafter Ware haben Sie gegenüber dem Verkäufer gesetzliche Rechte. Die gesetzliche Gewährleistung beträgt mindestens zwei Jahre. Bei einem Mangel können Sie grundsätzlich kostenlose Reparatur oder Ersatz verlangen; unter den gesetzlichen Voraussetzungen sind Preisminderung oder Vertragsauflösung möglich. Diese Rechte bestehen unabhängig von einer zusätzlichen gewerblichen Garantie.</p>
      <a href="/legal/eu-gewaehrleistung-de.svg" target="_blank" rel="noreferrer" className="mt-4 block" aria-label="EU-Mitteilung zur gesetzlichen Gewährleistung in voller Größe öffnen">
        <Image src="/legal/eu-gewaehrleistung-de.svg" alt="Offizielle EU-Mitteilung: Für alle Waren gilt eine gesetzliche Gewährleistung von mindestens zwei Jahren. Bei Mängeln bestehen Rechte auf kostenlose Reparatur oder Ersatz sowie gegebenenfalls Preisminderung oder Vertragsauflösung." width={595} height={842} unoptimized className="mx-auto h-auto w-full max-w-md" />
      </a>
      <a href="https://europa.eu/youreurope/citizens/consumers/shopping/guarantees-returns/index_de.htm" className="mt-3 inline-block text-sm underline underline-offset-4">Weitere Informationen der Europäischen Union</a>
    </section>
  );
}
