import type { CommerceFinderFrameShape } from "@/lib/commerce/types";

const copy: Record<CommerceFinderFrameShape, { title: string; text: string }> = {
  round: {
    title: "Außendurchmesser messen",
    text: "Von Außenkante zu Außenkante durch die Mitte des Rohres messen.",
  },
  square: {
    title: "Außenmaß messen",
    text: "Breite und Höhe jeweils von Außenkante zu Außenkante messen.",
  },
  rectangular: {
    title: "Breite und Höhe messen",
    text: "Erst die breite, dann die schmale Außenseite des Rohres messen.",
  },
  oval: {
    title: "Größte Breite und Höhe messen",
    text: "Die jeweils äußersten Punkte des ovalen Rohres als Außenmaß nehmen.",
  },
  cantilever: {
    title: "Rohr außen messen",
    text: "Breite und Höhe an einer geraden Stelle des Gestells messen.",
  },
};

export default function MeasurementGuide({ shape }: { shape: CommerceFinderFrameShape }) {
  const round = shape === "round";
  const guide = copy[shape];

  return (
    <aside className="grid gap-5 rounded-[1.75rem] bg-premium-warm/80 p-5 sm:grid-cols-[8rem_1fr] sm:items-center sm:p-6">
      <svg
        viewBox="0 0 140 104"
        role="img"
        aria-label={round ? "Messlinie über dem Außendurchmesser eines Rundrohrs" : "Messlinien für Breite und Höhe eines Rohres"}
        className="mx-auto w-32 text-premium-forest"
      >
        {round ? (
          <>
            <circle cx="70" cy="52" r="34" fill="none" stroke="currentColor" strokeWidth="4" />
            <path d="M36 52h68M36 44v16M104 44v16" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        ) : (
          <>
            <rect x="36" y="25" width="68" height="54" rx={shape === "oval" ? 27 : 3} fill="none" stroke="currentColor" strokeWidth="4" />
            <path d="M36 91h68M36 85v12M104 85v12M119 25v54M113 25h12M113 79h12" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        )}
      </svg>
      <div>
        <p className="text-sm font-semibold text-premium-ink">{guide.title}</p>
        <p className="mt-2 text-sm leading-6 text-premium-muted">{guide.text}</p>
        <p className="mt-2 text-xs leading-5 text-premium-subtle">Maß in Millimetern, möglichst mit einem Messschieber.</p>
      </div>
    </aside>
  );
}

