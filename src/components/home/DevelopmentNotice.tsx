export default function DevelopmentNotice() {
  return (
    <div
      className="mt-5 flex max-w-xl items-start gap-2 font-mono text-[0.6rem] font-medium uppercase leading-5 tracking-[0.13em] text-premium-muted sm:items-center"
      aria-label="Entwicklungsstatus der Website"
    >
      <span className="mt-[0.42rem] size-1.5 shrink-0 rounded-full bg-premium-sand sm:mt-0" aria-hidden="true" />
      <span>Website in Entwicklung · Inhalte werden laufend ergänzt</span>
    </div>
  );
}
