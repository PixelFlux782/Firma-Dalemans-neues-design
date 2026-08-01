import Image from "next/image";
import Link from "next/link";
import type { GalleryGroup, GalleryImage } from "@/lib/category-media";

export function ImageRail({ images, label = "Bildergalerie" }: { images: GalleryImage[]; label?: string }) {
  return (
    <>
    <p className="mb-3 text-xs font-medium text-premium-muted sm:hidden">Seitlich wischen für weitere Ansichten →</p>
    <div role="region" aria-label={label} tabIndex={0} className="gallery-rail -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
      {images.map((image) => (
        <figure key={image.src} className="premium-card min-w-[74vw] snap-start overflow-hidden sm:min-w-0">
          <div className="relative aspect-[4/3] bg-white">
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1280px) 21vw, (min-width: 640px) 42vw, 78vw" className="object-contain p-3" />
          </div>
          <figcaption className="border-t border-premium-beige/60 px-5 py-4 text-sm leading-6 text-premium-muted">{image.alt}</figcaption>
        </figure>
      ))}
      <span className="sr-only">Auf kleinen Bildschirmen horizontal scrollen, um weitere Bilder zu sehen.</span>
    </div>
    </>
  );
}

export default function ProductImageGallery({ groups }: { groups: GalleryGroup[] }) {
  return (
    <div className="space-y-14">
      {groups.map((group) => (
        <section key={group.title}>
          <div className="mb-7 max-w-3xl">
            <h3 className="font-display text-2xl font-medium text-premium-ink md:text-3xl">{group.title}</h3>
            <p className="mt-3 text-sm leading-7 text-premium-muted">{group.text}</p>
          </div>
          <ImageRail images={group.images} label={group.title} />
        </section>
      ))}
      <Link href="/kontakt?anliegen=Produktausf%C3%BChrung" className="btn-secondary inline-flex">Passende Ausführung gemeinsam klären</Link>
    </div>
  );
}
