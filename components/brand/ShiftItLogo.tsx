import Image from "next/image";

import { brand } from "@/lib/config/brand";
import { cn } from "@/lib/utils";

type ShiftItLogoProps = {
  variant?: "nav" | "hero" | "dark";
  className?: string;
  priority?: boolean;
};

const variantConfig = {
  nav: {
    src: brand.navLogoPath,
    width: 220,
    height: 52,
    sizes: "(max-width: 639px) 124px, 180px",
    className:
      "h-[30px] w-auto max-w-[124px] object-contain object-left md:h-9 md:max-w-[150px] lg:h-10 lg:max-w-[170px] xl:h-[40px] xl:max-w-[180px]",
    priority: true,
    alt: brand.appName,
  },
  hero: {
    src: brand.logoHeroPath,
    width: 1100,
    height: 280,
    sizes: "(max-width: 768px) 90vw, 520px",
    className: "h-auto w-full max-w-[min(520px,92vw)] object-contain",
    priority: false,
    alt: `${brand.appName} logo`,
  },
  dark: {
    src: brand.logoDarkPath,
    width: 1100,
    height: 280,
    sizes: "(max-width: 768px) 90vw, 600px",
    className: "h-auto w-full max-w-[min(600px,92vw)] object-contain",
    priority: false,
    alt: `${brand.appName} logo`,
  },
} as const;

export function ShiftItLogo({
  variant = "nav",
  className,
  priority,
}: ShiftItLogoProps) {
  const config = variantConfig[variant];

  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={config.width}
      height={config.height}
      sizes={config.sizes}
      priority={priority ?? config.priority}
      className={cn(config.className, className)}
    />
  );
}
