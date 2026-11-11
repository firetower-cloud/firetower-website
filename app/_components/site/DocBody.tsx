"use client";
import { useRef, useState } from "react";
import { ProductImage } from "./ProductImage";
// HTML is authored in content/docs and rendered at build time; no user HTML is accepted.
import type { Locale } from "../../_lib/i18n";
export function DocBody({
  html,
  locale = "en",
}: {
  html: string;
  locale?: Locale;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [image, setImage] = useState({ name: "home", title: "" });
  const [notice, setNotice] = useState("");
  return (
    <>
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={async (e) => {
          const target = e.target as HTMLElement;
          const copy = target.closest<HTMLButtonElement>(".copy");
          if (copy) {
            const code = copy.closest(".code")?.querySelector("code");
            if (!code) return;
            try {
              await navigator.clipboard.writeText(code.textContent || "");
              copy.textContent = locale === "fr" ? "Copié" : "Copied";
              setTimeout(() => {
                copy.textContent = locale === "fr" ? "Copier" : "Copy";
              }, 1800);
            } catch {
              const selection = window.getSelection();
              const range = document.createRange();
              range.selectNodeContents(code);
              selection?.removeAllRanges();
              selection?.addRange(range);
              setNotice(
                locale === "fr"
                  ? "Texte sélectionné. Copiez-le avec votre clavier."
                  : "Command selected. Copy it with your keyboard.",
              );
            }
            return;
          }
          const button = target.closest<HTMLButtonElement>("[data-image]");
          if (button) {
            setImage({
              name: button.dataset.image!,
              title:
                button.dataset.imageTitle ||
                button.querySelector("img")?.alt ||
                (locale === "fr"
                  ? "Capture de l’application"
                  : "Product screenshot"),
            });
            dialog.current?.showModal();
          }
        }}
      />
      <p className="sr-only" role="status">
        {notice}
      </p>
      <dialog
        ref={dialog}
        className="image-lightbox"
        aria-label={
          image.title ||
          (locale === "fr" ? "Capture de l’application" : "Product screenshot")
        }
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="lightbox-header">
          <h2>{image.title}</h2>
          <button onClick={() => dialog.current?.close()}>
            {locale === "fr" ? "Fermer" : "Close"}
          </button>
        </div>
        <ProductImage name={image.name} alt={image.title} />
        <p>
          {locale === "fr"
            ? "Application · données d’exemple"
            : image.name.startsWith("setup-")
              ? "Desktop app · sample data"
              : "Product interface · example content"}
        </p>
      </dialog>
    </>
  );
}
