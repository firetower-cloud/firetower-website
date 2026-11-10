import { translator, type LocalizedProps } from "../../_lib/i18n";
/* Approved website design, implemented as React components. */

export function FAQ({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  return (
    <section className="full-section shell faq-section" id="questions">
      <div>
        <h2>{t("A few practical answers.")}</h2>
        <p>{t("What to know before you start.")}</p>
      </div>
      <div className="faq-list">
        <details>
          <summary>{t("Where does my code run?")}</summary>
          <p>
            {t(
              "On the machines you connect to Firetower. Use a Mac mini, a cloud server or your own infrastructure. Agents use that machine’s tools and filesystem.",
            )}
          </p>
        </details>
        <details>
          <summary>{t("Can I really close my laptop?")}</summary>
          <p>
            {t(
              "Yes, when your agents run on another machine that stays on. Closing the app does not stop them. If your laptop is also the machine running the agents, putting it to sleep stops that work.",
            )}
          </p>
        </details>
        <details>
          <summary>
            {t("What happens if the Firetower server goes offline?")}
          </summary>
          <p>
            {t(
              "Existing agents keep running. Workers record events locally. Live coordination waits for the server, which catches up from worker logs when it reconnects.",
            )}
          </p>
        </details>
        <details>
          <summary>{t("Can a team share connected accounts?")}</summary>
          <p>
            {t(
              "Yes. Share a connected account with the teams that need it. Runs using it consume that account’s quota.",
            )}
          </p>
        </details>
        <details>
          <summary>{t("Does fallback happen automatically?")}</summary>
          <p>
            {t(
              "Only after you enable it and choose the accounts to use. A recognised usage-limit failure can trigger the next account in that order. If none is available, work needs your attention.",
            )}
          </p>
        </details>
      </div>
    </section>
  );
}
