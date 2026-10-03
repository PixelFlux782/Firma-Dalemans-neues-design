type LegalDocumentProps = {
  content: string;
};

export default function LegalDocument({ content }: LegalDocumentProps) {
  const paragraphs = content.trim().split(/\r?\n\s*\r?\n/);

  return (
    <div className="mt-10 space-y-7 text-sm leading-[1.85] text-premium-muted">
      {paragraphs.map((paragraph, index) => {
        const text = paragraph.trim();
        const numberedHeading = text.match(/^\d{1,2}\.\s+[^\r\n]+$/);
        const shortHeading =
          text.length < 100 &&
          !text.includes("\n") &&
          /^(?:[a-k]\)|Wordfence$|Auftragsverarbeitung$|iThemes Security$)/i.test(text);

        if (numberedHeading || shortHeading) {
          return (
            <h2
              key={index}
              className="pt-2 font-display text-xl font-medium tracking-[-0.02em] text-premium-ink"
            >
              {text}
            </h2>
          );
        }

        return (
          <p key={index} className="whitespace-pre-line">
            {text}
          </p>
        );
      })}
    </div>
  );
}
