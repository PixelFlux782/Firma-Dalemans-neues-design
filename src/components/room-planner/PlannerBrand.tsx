import Image from "next/image";

type Props = { variant?: "overlay" | "print"; className?: string };

export default function PlannerBrand({ variant = "overlay", className = "" }: Props) {
  return <div role="img" data-planner-brand={variant} className={`planner-brand planner-brand-${variant} ${className}`.trim()} aria-label="Dalemans Raumplaner">
    <Image src="/images/branding/dalemans-logo.webp" alt="" width={1024} height={576} sizes="62px" priority={variant === "print"} />
    <span><strong>Dalemans</strong><small>Raumplaner</small></span>
  </div>;
}
