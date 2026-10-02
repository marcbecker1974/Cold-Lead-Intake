import Image from "next/image";

// The skyline illustration, decorative only. "hero" is the full banner for
// Home; "strip" is a slim, bottom-anchored crop for working pages. The image
// is light in both color schemes, and the mask fades its bottom edge into the
// page background. Render one banner per page: it is preloaded.
const VARIANTS = {
  hero: {
    box: "aspect-[8/3]",
    image: "object-cover",
    sizes: "(min-width: 768px) 720px, 100vw",
  },
  strip: {
    box: "aspect-[4/1] sm:aspect-[8/1]",
    image: "object-cover object-[50%_58%]",
    sizes: "(min-width: 768px) 720px, 100vw",
  },
} as const;

export function SkylineBanner({ variant }: { variant: keyof typeof VARIANTS }) {
  const v = VARIANTS[variant];
  return (
    <div className={`relative overflow-hidden rounded-md ${v.box}`}>
      <Image
        src="/images/cold-lead-intake-header.png"
        alt=""
        fill
        sizes={v.sizes}
        preload
        className={`${v.image} [mask-image:linear-gradient(to_bottom,black_70%,transparent)]`}
      />
    </div>
  );
}
