"use client";
import { translator, type LocalizedProps } from "../../_lib/i18n";
import { useState } from "react";
import {
  LayoutDashboard,
  ListTodo,
  SlidersHorizontal,
  Shapes,
  GitPullRequest,
} from "lucide-react";
import { ProductImage } from "./ProductImage";
import { AgentTeamDiagram } from "./AgentTeamDiagram";
import { tabKey } from "./tabs";

const workflow = [
  {
    key: "home",
    label: "Overview",
    title: "See what’s running. Know what needs you.",
    description:
      "Follow active runs, review completed work and find the agents waiting for your input.",
    image: "home",
    mobile: "home-mobile",
    icon: LayoutDashboard,
  },
  {
    key: "trackers",
    label: "Connect your task tracker",
    title: "Bring the work into Firetower.",
    description:
      "Connect Linear or your git host’s issues. Pick a task and give your agent the context to start.",
    image: "setup-trackers",
    mobile: "tour-trackers-mobile",
    icon: ListTodo,
  },
  {
    key: "profiles",
    label: "Configure your agents",
    title: "Give every agent a clear role.",
    description:
      "Save instructions and skills in agent profiles. Assemble specialists into a team and choose where they run.",
    image: "profiles",
    mobile: "profiles-mobile",
    icon: SlidersHorizontal,
  },
  {
    key: "artifacts",
    label: "Generate artifacts",
    title: "Make the result easy to review.",
    description:
      "Open the reports, prototypes and diagrams your agents create. Leave feedback directly on the work.",
    image: "artifacts",
    mobile: "artifacts-mobile",
    icon: Shapes,
  },
  {
    key: "ship",
    label: "Open PRs",
    title: "Take the change to code review.",
    description:
      "Review the diff, commit your changes and open a pull request through your connected git host.",
    image: "tour-ship",
    mobile: "tour-ship-mobile",
    icon: GitPullRequest,
  },
];

export function ProductTour({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  const [index, setIndex] = useState(0);
  const step = workflow[index];
  return (
    <section className="tour shell full-tour" id="teams">
      <div className="section-intro">
        <h2>
          {t("Create teams of Coding Agents on the infrastructure you want")}
        </h2>
        <p>
          {t(
            "Choose the agent and machine for every role. Let an orchestrator delegate the work.",
          )}
        </p>
      </div>
      <AgentTeamDiagram locale={locale} />
      <h2 className="product-tour-heading" id="product-tour-heading">
        {t("Streamline your agentic work")}
      </h2>
      <div
        className="workflow-tour-tabs"
        role="tablist"
        aria-labelledby="product-tour-heading"
      >
        {workflow.map(({ key, label, icon: Icon }, i) => (
          <button
            key={key}
            role="tab"
            id={`tour-tab-${key}`}
            aria-controls="tour-panel"
            aria-selected={index === i}
            tabIndex={index === i ? 0 : -1}
            onClick={() => setIndex(i)}
            onKeyDown={(e) => tabKey(e, i, workflow.length, setIndex)}
          >
            <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
            <span>{t(label)}</span>
          </button>
        ))}
      </div>
      <div
        className="workflow-tour-panel"
        role="tabpanel"
        id="tour-panel"
        aria-labelledby={`tour-tab-${step.key}`}
        tabIndex={0}
      >
        <div className="workflow-tour-description">
          <h3>{t(step.title)}</h3>
          <p>{t(step.description)}</p>
        </div>
        <div className="tour-image">
          <ProductImage
            name={step.image}
            alt={`Firetower: ${t(step.label)}`}
            className="desktop-shot"
          />
          <ProductImage
            name={step.mobile}
            alt={`Firetower: ${t(step.label)}`}
            className="mobile-shot"
          />
        </div>
      </div>
    </section>
  );
}
