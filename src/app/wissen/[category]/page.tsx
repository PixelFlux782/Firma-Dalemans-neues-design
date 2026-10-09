import { notFound, redirect } from "next/navigation";

const legacyDestinations: Record<string, string> = {
  "stoffe-polster": "/wissen/stoffe-und-bezuege",
  "tischplatten-oberflaechen": "/wissen/tischplatten-und-kanten",
  tischkanten: "/wissen/tischplatten-und-kanten#kanten",
  "tische-konstruktion": "/wissen/klapptische-richtig-waehlen",
};

export default async function LegacyKnowledgeCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const destination = legacyDestinations[(await params).category];
  if (!destination) notFound();
  redirect(destination);
}
