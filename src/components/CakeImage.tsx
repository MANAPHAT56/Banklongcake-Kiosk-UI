import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function CakeImage({ src, alt, className, imageClassName }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const trimmed = src?.trim() ?? "";
  const showImage = Boolean(trimmed) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-secondary/40", className)}>
      {showImage ? (
        <img
          src={trimmed}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full object-cover", imageClassName)}
          onError={() => setFailed(true)}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary via-primary/10 to-secondary"
          aria-hidden
        >
          <span className="select-none text-5xl opacity-90">🍰</span>
        </div>
      )}
    </div>
  );
}
