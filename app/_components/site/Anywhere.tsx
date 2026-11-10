"use client";
/* Approved website design, implemented as React components. */
import { useState } from "react";
import { ProductImage } from "./ProductImage";
export function Anywhere() {
  const [answered, setAnswered] = useState(false);
  return (
    <section className="full-section shell" id="anywhere">
      <div className="full-heading">
        <h2>
          Pick up where you <br />
          left off. Anywhere.
        </h2>
        <p>
          Start on Mac or Windows. Review progress, answer an agent and keep
          work moving from iOS or Android.
        </p>
      </div>
      <div className="device-showcase">
        <div className="desktop-device">
          <div className="device-title">
            <span>At your desk</span>
            <span>Mac · Windows</span>
          </div>
          <ProductImage
            name="team"
            alt="Firetower desktop: quota meter task, agent team and review question"
            className=""
          />
        </div>
        <div className="phone-device">
          <div className="phone-status">
            <b>9:41</b>
            <span>••• ▰</span>
          </div>
          <div className="phone-nav">
            <span>‹</span>
            <strong>Quota meter rounding</strong>
            <span>···</span>
          </div>
          <div className="phone-meta">
            {answered ? "Ada is working" : "Ada needs your input"}
          </div>
          <div className="phone-conversation">
            <div className="phone-avatar">A</div>
            <strong>
              Ada <small>Claude Code</small>
            </strong>
            <p>
              The quota meter and API use different thresholds. I’ve made them
              use the same helper.
            </p>
            <p className="phone-question">
              Should a plan with no soft limit stay neutral until the hard
              limit?
            </p>
            <div className="phone-answer" id="phone-answer" hidden={!answered}>
              Yes. Keep it neutral until the hard limit.
            </div>
          </div>
          <div className="phone-reply">
            <button id="phone-reply" onClick={() => setAnswered(!answered)}>
              {answered ? "Replay example ↺" : "Keep it neutral ↑"}
            </button>
            <small id="phone-feedback" aria-live="polite">
              {answered
                ? "Reply sent. Ada can continue."
                : "Try answering from your phone."}
            </small>
          </div>
          <div className="phone-home"></div>
        </div>
      </div>
      <div className="anywhere-bottom">
        <div className="platform-names">
          <span>macOS</span>
          <span>Windows</span>
          <span>iOS</span>
          <span>Android</span>
        </div>
      </div>
    </section>
  );
}
