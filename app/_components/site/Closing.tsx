/* eslint-disable @next/next/no-img-element */
/* Approved website design, implemented as React components. */
import { DownloadButton } from "./DownloadButton";
export function Closing() {
  return (
    <section className="shell">
      <div className="closing">
        <img
          className="closing-art"
          src="/brand/decoration-1.webp"
          alt=""
          aria-hidden="true"
        />
        <div className="closing-content">
          <h2>
            Bring your agent teams <br />
            to Firetower.
          </h2>
          <p>
            Your infrastructure. Your accounts. <br />
            One place to manage the work.
          </p>
          <DownloadButton />
        </div>
      </div>
    </section>
  );
}
