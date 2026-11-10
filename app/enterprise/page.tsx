import type { Metadata } from "next";
import { Header } from "../_components/site/Header";
import { Footer } from "../_components/site/Footer";
import { JsonLd } from "../_components/JsonLd";
import { enterpriseLd } from "../_lib/structured-data";
import { ENTERPRISE_TITLE, ENTERPRISE_DESCRIPTION } from "../_lib/enterprise";
import { SITE_URL, NAME } from "../_lib/site";
import { EnterpriseContact } from "../_components/site/EnterpriseContact";
import "../_components/site/home.css";
import "./enterprise.css";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: { absolute: ENTERPRISE_TITLE },
  description: ENTERPRISE_DESCRIPTION,
  alternates: {
    canonical: "/enterprise",
    types: { "text/markdown": `${SITE_URL}/enterprise.md` },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/enterprise`,
    siteName: NAME,
    title: ENTERPRISE_TITLE,
    description: ENTERPRISE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: ENTERPRISE_TITLE,
    description: ENTERPRISE_DESCRIPTION,
  },
};

export default function EnterprisePage() {
  return (
    <div className="marketing-site enterprise-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <JsonLd data={enterpriseLd()} />
      <Header enterprise />
      <main id="main-content">
        <section className="offer-hero offer-wrap">
          <div>
            <p className="eyebrow">Firetower for enterprise</p>
            <h1>
              Your infrastructure.
              <br />
              Our expertise.
            </h1>
            <p className="lead">
              Bring AI agent teams into your company. We help you deploy
              Firetower, build your first workflows, and support your rollout.
            </p>
            <div className="offer-actions">
              <EnterpriseContact label="Discuss your deployment" />
              <a href="#services" className="quiet-link">
                How we can help
              </a>
            </div>
            <p className="offer-micro">
              Free to self-host. Expert help when you need it.
            </p>
          </div>
          <div>
            <div
              className="deployment"
              role="img"
              aria-label="Deployment model: your infrastructure contains the Firetower control plane and worker machines. The Firetower team provides deployment, workflow and support services through access agreed with you."
            >
              <div className="boundary">
                <div className="boundary-label">
                  <svg className="offer-icon" viewBox="0 0 24 24">
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  Your infrastructure
                </div>
                <div className="machine control">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 64 80"
                    className="tower"
                    aria-hidden="true"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.1"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                    >
                      <path d="M7 25 32 7l25 18H7Z" />
                      <path d="M17 25v19h30V25M23 44 13 73M41 44l10 29M18 59h28" />
                    </g>
                    <rect
                      x="29"
                      y="31"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                  </svg>
                  <div>
                    <strong>Firetower control plane</strong>
                    <small>Your people, permissions and resources</small>
                  </div>
                </div>
                <div className="connector"></div>
                <div className="workers">
                  <div className="machine">
                    <svg className="offer-icon" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="6" rx="1" />
                      <rect x="3" y="14" width="18" height="6" rx="1" />
                      <path d="M7 7h.1M7 17h.1" />
                    </svg>
                    <strong>Your cloud</strong>
                    <small>Agents on worker machines</small>
                  </div>
                  <div className="machine">
                    <svg className="offer-icon" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="13" rx="1" />
                      <path d="M8 21h8m-4-5v5" />
                    </svg>
                    <strong>Your machines</strong>
                    <small>On premises or in the office</small>
                  </div>
                </div>
                <p className="boundary-foot">
                  You choose the infrastructure, agents and model providers.
                </p>
              </div>
              <div className="service-bridge"></div>
              <div className="service-node">
                <div>
                  <strong>The Firetower team</strong>
                  <small>Deployment · Workflows · Support</small>
                </div>
                <span className="support-circle">
                  <svg className="offer-icon" viewBox="0 0 24 24">
                    <path d="M4 13v-1a8 8 0 0 1 16 0v1M4 12H3v6h4v-6H4Zm16 0h1v6h-4v-6h3Zm0 6v2h-7" />
                  </svg>
                </span>
              </div>
            </div>
            <p className="diagram-caption">
              Support access is agreed with your team.
            </p>
          </div>
        </section>
        <div className="promise offer-wrap">
          <span>
            <svg className="offer-icon" viewBox="0 0 24 24">
              <path d="m5 12 4 4L19 6" />
            </svg>
            Deploy on infrastructure you control
          </span>
          <span>
            <svg className="offer-icon" viewBox="0 0 24 24">
              <path d="m5 12 4 4L19 6" />
            </svg>
            Bring your agents and subscriptions
          </span>
          <span>
            <svg className="offer-icon" viewBox="0 0 24 24">
              <path d="m5 12 4 4L19 6" />
            </svg>
            Work directly with the product team
          </span>
        </div>
        <section className="offer-section offer-wrap" id="services">
          <div className="sectionhead">
            <h2>
              From a first deployment
              <br />
              to everyday work.
            </h2>
            <p>
              Get help where it matters. We agree the scope with your team, from
              initial setup to ongoing support.
            </p>
          </div>
          <article className="service-row">
            <div className="service-title">
              <svg className="offer-icon" viewBox="0 0 24 24">
                <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />
              </svg>
              <div>
                <h3>Deploy with confidence</h3>
                <span className="tag">Deployment & onboarding</span>
              </div>
            </div>
            <p>
              Set up Firetower in your environment. Connect your machines and
              tools, define access, and get your first team ready.
            </p>
            <ul>
              <li>Infrastructure and access planning</li>
              <li>Installation and integrations</li>
              <li>Administrator training and handover</li>
            </ul>
          </article>
          <article className="service-row">
            <div className="service-title">
              <svg className="offer-icon" viewBox="0 0 24 24">
                <rect x="9" y="2" width="6" height="6" rx="1" />
                <rect x="2" y="16" width="6" height="6" rx="1" />
                <rect x="16" y="16" width="6" height="6" rx="1" />
                <path d="M12 8v4M5 16v-4h14v4" />
              </svg>
              <div>
                <h3>Put agents to work</h3>
                <span className="tag">Workflow implementation</span>
              </div>
            </div>
            <p>
              Turn a real task into a repeatable workflow. Configure agent
              profiles, skills and delegation around the way your team works.
            </p>
            <ul>
              <li>Use-case selection and scoping</li>
              <li>Agent teams, profiles and skills</li>
              <li>Evaluation on representative tasks</li>
            </ul>
          </article>
          <article className="service-row">
            <div className="service-title">
              <svg className="offer-icon" viewBox="0 0 24 24">
                <path d="M4 13v-1a8 8 0 0 1 16 0v1M4 12H3v6h4v-6H4Zm16 0h1v6h-4v-6h3Zm0 6v2h-7" />
              </svg>
              <div>
                <h3>Keep moving forward</h3>
                <span className="tag">Optional ongoing support</span>
              </div>
            </div>
            <p>
              Give your administrators a direct technical contact. Get help
              diagnosing issues, planning updates and expanding your rollout.
            </p>
            <ul>
              <li>Technical troubleshooting</li>
              <li>Upgrade and maintenance guidance</li>
              <li>Regular deployment reviews</li>
            </ul>
          </article>
        </section>
        <section className="pilot-band">
          <div className="offer-section offer-wrap">
            <div className="pilot-layout">
              <div>
                <p className="eyebrow">A practical place to start</p>
                <h2>
                  One team.
                  <br />
                  Real work.
                  <br />A clear handover.
                </h2>
                <p>
                  Start with a focused pilot. Choose two workflows, agree what
                  success looks like, and evaluate the results before expanding.
                </p>
                <div className="offer-actions">
                  <EnterpriseContact label="Plan your first deployment" />
                </div>
              </div>
              <div className="pilot-outcomes">
                <h3>What your team leaves with</h3>
                <div className="outcome">
                  <span>✓</span> Firetower deployed in an agreed environment
                </div>
                <div className="outcome">
                  <span>✓</span> Your first team onboarded with permissions set
                </div>
                <div className="outcome">
                  <span>✓</span> Two workflows configured and evaluated
                </div>
                <div className="outcome">
                  <span>✓</span> An administrator guide and handover session
                </div>
                <div className="outcome">
                  <span>✓</span> A plan for rollout and optional support
                </div>
              </div>
            </div>
            <div className="workflow-examples">
              <article>
                <span className="offer-micro">Engineering</span>
                <h3>From issue to draft pull request</h3>
                <p>
                  Connect incoming work to an agent team. Keep implementation
                  and review in your existing git workflow.
                </p>
              </article>
              <article>
                <span className="offer-micro">Knowledge</span>
                <h3>Documentation that follows the work</h3>
                <p>
                  Review changes, draft documentation updates, and leave the
                  final decision with your team.
                </p>
              </article>
              <article>
                <span className="offer-micro">Operations</span>
                <h3>Reports ready for review</h3>
                <p>
                  Turn approved files and connected tools into summaries,
                  follow-up tasks and operational reports.
                </p>
              </article>
            </div>
          </div>
        </section>
        <section className="offer-section offer-wrap">
          <div className="sectionhead">
            <h2>
              A rollout shaped
              <br />
              around your company.
            </h2>
            <p>
              Agree the requirements first. Then build a working deployment your
              team understands and can operate.
            </p>
          </div>
          <ol className="journey">
            <li>
              <h3>Define the scope</h3>
              <p>
                Discuss your environment, access requirements and first use
                cases.
              </p>
            </li>
            <li>
              <h3>Run the pilot</h3>
              <p>
                Deploy Firetower and evaluate the agreed workflows with your
                team.
              </p>
            </li>
            <li>
              <h3>Hand it over</h3>
              <p>
                Train your administrators and document how the installation is
                run.
              </p>
            </li>
            <li>
              <h3>Choose your support</h3>
              <p>
                Operate independently or continue with an agreed support
                engagement.
              </p>
            </li>
          </ol>
        </section>
        <div className="offer-wrap">
          <section className="ownerband">
            <div>
              <h3>You keep control.</h3>
              <p>
                Your company chooses the infrastructure, provider accounts and
                resource permissions. Any access needed by our team is agreed
                with you.
              </p>
            </div>
            <div>
              <h3>We make the responsibilities clear.</h3>
              <p>
                Deployment work, support hours and response targets are defined
                in your proposal. Infrastructure and AI provider costs remain
                separate.
              </p>
              <p className="offer-micro">
                Need help operating the installation? We can discuss the scope.
              </p>
            </div>
          </section>
        </div>
        <section className="offer-section offer-wrap faq-layout">
          <h2>
            A few things
            <br />
            worth knowing.
          </h2>
          <div>
            <details open>
              <summary>Is Firetower still free to self-host?</summary>
              <p>
                Yes. You can run the public product independently. This offer
                adds deployment help, workflow implementation and ongoing
                support.
              </p>
            </details>
            <details>
              <summary>Will this run in our infrastructure?</summary>
              <p>
                That is the starting point. We scope the deployment around your
                environment and agree who operates each part. Access for our
                team is defined with you.
              </p>
            </details>
            <details>
              <summary>Can you work with our security requirements?</summary>
              <p>
                Bring your identity, access and operational requirements to the
                first conversation. We assess what is supported, identify gaps
                and agree the scope before work starts.
              </p>
            </details>
            <details>
              <summary>Do we need to change our AI subscriptions?</summary>
              <p>
                You bring supported provider subscriptions or API credentials.
                We help configure accounts and fallback. Provider charges and
                terms remain separate from Firetower services.
              </p>
            </details>
            <details>
              <summary>What does ongoing support include?</summary>
              <p>
                Technical troubleshooting, upgrade guidance and deployment
                reviews within an agreed scope. Coverage hours and response
                targets are defined in the support agreement.
              </p>
            </details>
          </div>
        </section>
        <section className="offer-closing offer-wrap">
          <h2>Let’s plan your deployment.</h2>
          <p>
            Tell us where you want to run Firetower and what you want your first
            agent team to do.
          </p>
          <EnterpriseContact label="Discuss your deployment" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
