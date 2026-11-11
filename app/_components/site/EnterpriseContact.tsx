"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { translator, type Locale } from "../../_lib/i18n";
import { ENTERPRISE_BOOKING_URL } from "../../_lib/site";
import "./enterprise-booking.css";

function BookingDialog({
  url,
  locale,
  onClose,
  trigger,
}: {
  url: string;
  locale: Locale;
  onClose: () => void;
  trigger: RefObject<HTMLAnchorElement | null>;
}) {
  const t = translator(locale);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    const opener = trigger.current;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, [trigger]);

  useEffect(() => {
    if (loaded) return;
    const timer = setTimeout(() => setSlow(true), 12_000);
    return () => clearTimeout(timer);
  }, [loaded]);

  return createPortal(
    <dialog
      ref={dialog}
      className="enterprise-booking"
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <header className="enterprise-booking-header">
        <div>
          <p>Firetower Enterprise</p>
          <h2 id={`${id}-title`}>{t("Discuss your deployment")}</h2>
        </div>
        <button
          type="button"
          className="enterprise-booking-close"
          aria-label={t("Close booking")}
          onClick={onClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </header>
      <div className="enterprise-booking-content">
        {!loaded && (
          <p className="enterprise-booking-loading" role="status">
            {slow
              ? t(
                  "Taking longer than expected. You can open Calendly directly below.",
                )
              : t("Loading available times…")}
          </p>
        )}
        <iframe
          src={url}
          title={t("Book a Firetower Enterprise call with Kevin")}
          onLoad={() => setLoaded(true)}
        />
      </div>
      <footer className="enterprise-booking-footer">
        <span>{t("Scheduling with Calendly")}</span>
        <a
          href={
            locale === "fr"
              ? `${ENTERPRISE_BOOKING_URL}?locale=fr`
              : ENTERPRISE_BOOKING_URL
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("Open in a new tab")}
          <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </dialog>,
    document.body,
  );
}

/** Links still work without JavaScript; normal clicks open an on-demand embed. */
export function EnterpriseContact({
  label,
  locale = "en",
}: {
  label?: string;
  locale?: Locale;
}) {
  const t = translator(locale);
  const trigger = useRef<HTMLAnchorElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  return (
    <>
      <a
        ref={trigger}
        className="button"
        href={
          locale === "fr"
            ? `${ENTERPRISE_BOOKING_URL}?locale=fr`
            : ENTERPRISE_BOOKING_URL
        }
        target="_blank"
        rel="noopener noreferrer"
        aria-haspopup="dialog"
        onClick={(event) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
          )
            return;
          event.preventDefault();
          const embed = new URL(ENTERPRISE_BOOKING_URL);
          embed.searchParams.set("embed_domain", window.location.host);
          embed.searchParams.set("embed_type", "Inline");
          embed.searchParams.set("locale", locale);
          const dark = document.documentElement.dataset.theme === "dark";
          embed.searchParams.set(
            "background_color",
            dark ? "161615" : "f8f8f7",
          );
          embed.searchParams.set("text_color", dark ? "f0f0ec" : "111110");
          embed.searchParams.set("primary_color", dark ? "d4d4ce" : "333330");
          setUrl(embed.toString());
        }}
      >
        {label ?? t("Discuss your deployment")}
      </a>
      {url && (
        <BookingDialog
          locale={locale}
          url={url}
          trigger={trigger}
          onClose={() => setUrl(null)}
        />
      )}
    </>
  );
}
