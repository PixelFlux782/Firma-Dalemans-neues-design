import Image from "next/image";

interface SoftFadedProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
}

export default function SoftFadedProductImage({
  src,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 42vw, 100vw",
  className = "",
  imageClassName = "",
}: SoftFadedProductImageProps) {
  return (
    <div className={`soft-faded-product-image relative isolate ${className}`}>
      <div className="soft-faded-product-image__wash pointer-events-none absolute inset-[4%]" aria-hidden="true" />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-contain p-[7%] sm:p-[8%] ${imageClassName}`}
      />
    </div>
  );
}
