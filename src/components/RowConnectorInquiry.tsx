"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  product: string;
  execution: string;
  specifications: { name: string; value: string }[];
  id: string;
};

export default function RowConnectorInquiry({ product, execution, specifications, id }: Props) {
  const [quantity, setQuantity] = useState("");
  const message = [
    `Ich interessiere mich für: ${product}`,
    `Ausführung: ${execution}`,
    ...specifications.map(({ name, value }) => `${name}: ${value}`),
    ...(quantity ? [`Gewünschte Menge: ${quantity}`] : []),
  ].join("\n");
  const params = new URLSearchParams({ produkt: product, variante: execution, nachricht: message });

  return <div className="mt-auto pt-7">
    <label htmlFor={`${id}-quantity`} className="block text-sm font-medium text-premium-charcoal">Gewünschte Menge <span className="font-normal text-premium-muted">(optional)</span></label>
    <input id={`${id}-quantity`} type="number" min="1" step="1" inputMode="numeric" value={quantity} onChange={event => setQuantity(event.target.value)} className="form-input mb-4 max-w-40" placeholder="z. B. 20" />
    <Link href={`/kontakt?${params}`} className="btn-primary min-h-12 w-full text-center" onClick={event => {
      const input = document.getElementById(`${id}-quantity`) as HTMLInputElement | null;
      if (input && !input.reportValidity()) event.preventDefault();
    }}>Reihenverbinder anfragen</Link>
  </div>;
}
