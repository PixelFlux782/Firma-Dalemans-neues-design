import Image from "next/image";

type Props = { variant?: "overlay" | "print"; className?: string };

export default function PlannerBrand({ variant = "overlay", className = "" }: Props) {
  return <div data-planner-brand={variant} className={`planner-brand planner-brand-${variant} ${className}`.trim()} aria-label="Dalemans Raumplaner">
    <Image src="/Logos/logo_transp.png" alt="" width={1672} height={941} sizes="62px" unoptimized priority={variant === "print"} />
    <span><strong>Dalemans</strong><small>Raumplaner</small></span>
  </div>;
}
