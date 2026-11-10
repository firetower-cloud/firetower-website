/* Approved website design, implemented as React components. */

export function FAQ() {
  return (
    <section className="full-section shell faq-section" id="questions">
      <div>
        <h2>A few practical answers.</h2>
        <p>What to know before you start.</p>
      </div>
      <div className="faq-list">
        <details>
          <summary>Where does my code run?</summary>
          <p>
            On the machines you connect to Firetower. Use a Mac mini, a cloud
            server or your own infrastructure. Agents use that machine’s tools
            and filesystem.
          </p>
        </details>
        <details>
          <summary>Can I really close my laptop?</summary>
          <p>
            Yes, when your agents run on another machine that stays on. Closing
            the app does not stop them. If your laptop is also the machine
            running the agents, putting it to sleep stops that work.
          </p>
        </details>
        <details>
          <summary>What happens if the Firetower server goes offline?</summary>
          <p>
            Existing agents keep running. Workers record events locally. Live
            coordination waits for the server, which catches up from worker logs
            when it reconnects.
          </p>
        </details>
        <details>
          <summary>Can a team share connected accounts?</summary>
          <p>
            Yes. Share a connected account with the teams that need it. Runs
            using it consume that account’s quota.
          </p>
        </details>
        <details>
          <summary>Does fallback happen automatically?</summary>
          <p>
            Only after you enable it and choose the accounts to use. A
            recognised usage-limit failure can trigger the next account in that
            order. If none is available, work needs your attention.
          </p>
        </details>
      </div>
    </section>
  );
}
