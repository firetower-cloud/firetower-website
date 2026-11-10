/* Local screenshots are already sized and encoded as WebP. */
"use client";
import { useRef } from "react";
import sizes from "./image-sizes.json";
export function ProductImage({
  name,
  alt,
  className = "",
  priority = false,
  mobileName,
}: {
  name: string;
  alt: string;
  className?: string;
  priority?: boolean;
  mobileName?: string;
}) {
  const dimensions = sizes[name as keyof typeof sizes];
  const mobileDimensions = mobileName
    ? sizes[mobileName as keyof typeof sizes]
    : undefined;
  return (
    <span className={`themed-image ${className}`}>
      {(["light", "dark"] as const).map((theme) => (
        <picture key={theme} style={{ display: "contents" }}>
          {mobileName && (
            <source
              media="(max-width: 740px)"
              srcSet={`/product/${mobileName}-${theme}.webp`}
              width={mobileDimensions?.width}
              height={mobileDimensions?.height}
            />
          )}
          <img
            className={`image-${theme}`}
            src={`/product/${name}-${theme}.webp`}
            alt={alt}
            width={dimensions?.width}
            height={dimensions?.height}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
          />
        </picture>
      ))}
    </span>
  );
}
export function ImageViewer({
  name,
  title,
  children,
  className = "modal-launch",
  caption = "Product interface · example content",
}: {
  name: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  caption?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => dialog.current?.showModal()}
        aria-label={`Enlarge: ${title}`}
      >
        {children}
      </button>
      <dialog
        ref={dialog}
        className="image-lightbox"
        aria-label={title}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="lightbox-header">
          <h2>{title}</h2>
          <button
            onClick={() => dialog.current?.close()}
            aria-label="Close image"
          >
            Close
          </button>
        </div>
        <ProductImage name={name} alt={title} />
        <p>{caption}</p>
      </dialog>
    </>
  );
}
