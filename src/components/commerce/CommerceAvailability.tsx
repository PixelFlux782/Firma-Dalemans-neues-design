import type { CommerceAvailabilityStatus } from "@/lib/commerce/types";

const labels: Record<CommerceAvailabilityStatus, string> = {
  in_stock: "Verfügbar",
  out_of_stock: "Derzeit nicht verfügbar",
  on_request: "Verfügbarkeit auf Anfrage",
  unknown: "Verfügbarkeit folgt",
};

export default function CommerceAvailability({
  status,
  note,
  className = "",
}: {
  status: CommerceAvailabilityStatus;
  note?: string | null;
  className?: string;
}) {
  const dotClass =
    status === "in_stock"
      ? "bg-premium-moss"
      : status === "out_of_stock"
        ? "bg-premium-subtle"
        : "bg-premium-sand";

  return (
    <div className={className} data-availability={status}>
      <p className="flex items-center gap-2 text-sm font-medium text-premium-charcoal">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
        {labels[status]}
      </p>
      {note ? <p className="mt-2 text-sm leading-6 text-premium-muted">{note}</p> : null}
    </div>
  );
}
