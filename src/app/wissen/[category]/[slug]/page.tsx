import { notFound, redirect } from "next/navigation";

export default async function LegacyKnowledgeArticlePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const match = category === "stoffe-polster" ? slug.match(/^stoffgruppe-([234])$/) : null;
  if (!match) notFound();
  redirect(`/wissen/stoffkarten#stoffgruppe-${match[1]}`);
}
