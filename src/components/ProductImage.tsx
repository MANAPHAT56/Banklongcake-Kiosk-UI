import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function ProductImage({ src, alt, className, imageClassName }: Props) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const trimmed = src?.trim() ?? "";
  const isFailed = failedSrc === trimmed;
  const isLoaded = loadedSrc === trimmed;
  const showImage = Boolean(trimmed) && !isFailed;

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {/* Placeholder — visible until image loads */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-secondary via-blush to-cream text-center transition-opacity duration-200",
          showImage && isLoaded ? "opacity-0" : "opacity-100",
        )}
        aria-hidden={showImage && isLoaded}
      >
        <span className="rounded-full bg-card/75 px-3 py-1 text-xs font-bold text-muted-foreground shadow-sm">
          บ้านกล่องเค้ก
        </span>
        <span className="text-[11px] font-semibold text-muted-foreground/80">
          No image
        </span>
      </div>

      {/* key={trimmed} ทำให้ remount เฉพาะตอน src เปลี่ยนจริงๆ */}
      {showImage && (
        <img
          key={trimmed}
          src={trimmed}
          alt={alt}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            isLoaded ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
          onLoad={() => setLoadedSrc(trimmed)}
          onError={() => setFailedSrc(trimmed)}
          loading="lazy"
          draggable={false}
        />
      )}
    </div>
  );
}