import CinematicMediaPlaceholder, {
  type CinematicMood,
} from "@/components/CinematicMediaPlaceholder";

interface PremiumImagePlaceholderProps {
  label: string;
  todoNote?: string;
  mood?: CinematicMood;
  className?: string;
  variant?: "hero" | "editorial" | "card" | "strip";
}

const defaultMood: Record<
  NonNullable<PremiumImagePlaceholderProps["variant"]>,
  CinematicMood
> = {
  hero: "hero-dawn",
  editorial: "stone-arch",
  card: "warm-hall",
  strip: "soft-partners",
};

/** Backward-compatible wrapper — prefer CinematicMediaPlaceholder on new code */
export default function PremiumImagePlaceholder({
  label,
  todoNote,
  mood,
  className = "",
  variant = "card",
}: PremiumImagePlaceholderProps) {
  return (
    <CinematicMediaPlaceholder
      ariaLabel={label}
      devNote={todoNote}
      mood={mood ?? defaultMood[variant]}
      variant={variant}
      className={className}
    />
  );
}
