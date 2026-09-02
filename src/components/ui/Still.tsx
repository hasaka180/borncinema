"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  vignette?: boolean;
  deep?: boolean;
  zoom?: boolean;
  priority?: boolean;
  imgClassName?: string;
}

/** A cinematic still: graded per theme, with a gradient fallback if the image cannot load. */
export function Still({ src, alt = "", vignette, deep, zoom, priority, className, imgClassName, children, ...rest }: Props) {
  const [failed, setFailed] = useState(!src);
  return (
    <div className={cn("still", vignette && "vignette", deep && "deep", failed && "gradient-fallback", className)} {...rest}>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} className={cn(zoom && "anim-slow-zoom", imgClassName)} />
      )}
      {children}
    </div>
  );
}
