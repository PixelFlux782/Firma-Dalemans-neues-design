type LegalDocumentProps = {
  content: string;
  notice?: string;
};

function headingId(value: string) {
  return value
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inlineContent(value: string) {
  return value.split(/(\[[^\]]+\]\(https:\/\/[^\s)]+\)|\/widerruf\b)/g).map((part, index) => {
    const link = /^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/.exec(part);
    if (link || part === "/widerruf") {
      return <a key={index} href={link ? link[2] : part} className="break-words underline underline-offset-4 hover:text-premium-bronze">{link ? link[1] : "Widerruf und Muster-Widerrufsformular"}</a>;
    }
    return part;
  });
}

export default function LegalDocument({ content, notice }: LegalDocumentProps) {
  const paragraphs = content.trim().split(/\r?\n\s*\r?\n/);
  const headings = paragraphs
    .filter((paragraph) => paragraph.trim().startsWith("## "))
    .map((paragraph) => paragraph.trim().slice(3));

  return (
    <div className="mt-10 text-sm leading-[1.85] text-premium-muted">
      {notice ? (
        <div role="note" className="rounded-2xl border border-amber-700/25 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
          <strong className="font-semibold">Freigabestatus:</strong> {notice}
        </div>
      ) : null}

      {headings.length > 3 ? (
        <nav aria-label="Inhaltsverzeichnis" className="mt-8 rounded-2xl border border-premium-beige bg-white/55 p-5 sm:p-6">
          <p className="font-semibold text-premium-ink">Inhalt</p>
          <ol className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {headings.map((heading) => (
              <li key={heading}>
                <a href={`#${headingId(heading)}`} className="rounded-sm underline-offset-4 transition hover:text-premium-bronze hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="mt-10 space-y-7">
        {paragraphs.map((paragraph, index) => {
          const text = paragraph.trim();
          const markdownHeading = text.startsWith("## ") ? text.slice(3) : null;

          if (markdownHeading) {
            return (
              <h2
                key={index}
                id={headingId(markdownHeading)}
                className="scroll-mt-28 pt-4 font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink"
              >
                {markdownHeading}
              </h2>
            );
          }

          const lines = text.split(/\r?\n/);
          if (lines.every((line) => line.startsWith("- "))) {
            return (
              <ul key={index} className="list-disc space-y-2 pl-5 marker:text-premium-bronze">
                {lines.map((line) => <li key={line}>{inlineContent(line.slice(2))}</li>)}
              </ul>
            );
          }

          return (
            <p key={index} className="whitespace-pre-line">
              {inlineContent(text)}
            </p>
          );
        })}
      </div>
    </div>
  );
}
