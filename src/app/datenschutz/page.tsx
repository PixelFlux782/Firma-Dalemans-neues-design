import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DatenschutzPage() {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-stone-200">
      <h1 className="text-3xl font-bold text-stone-900">Datenschutzerklärung</h1>
      <p className="mt-4 text-stone-700">
        Hier folgt die individuelle Datenschutzerklärung. Platzhaltertext – bitte
        durch einen rechtssicheren Text ersetzen.
      </p>
    </div>
  );
}

