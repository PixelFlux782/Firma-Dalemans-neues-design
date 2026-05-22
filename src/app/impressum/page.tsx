import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ImpressumPage() {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-stone-200">
      <h1 className="text-3xl font-bold text-stone-900">Impressum</h1>
      <p className="mt-4 text-stone-700">
        Verantwortlich für den Inhalt dieser Seite ist:
      </p>
      <p className="mt-4 text-stone-700">
        Firmenname
        <br />
        Inhaber: Max Mustermann
        <br />
        Musterstraße 1
        <br />
        12345 Musterstadt
        <br />
        Deutschland
      </p>
    </div>
  );
}

