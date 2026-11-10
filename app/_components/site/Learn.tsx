/* Approved website design, implemented as React components. */

export function Learn() {
  return (
    <section className="learn shell">
      <div>
        <h2>
          A clear path to <br />
          your first team.
        </h2>
        <p>
          Start a workspace. Save a profile. Build a team. Short guides show you
          each step.
        </p>
      </div>
      <div className="guide-links">
        <button>
          Start your first workspace<span>Getting started</span>
        </button>
        <button>
          Give an agent a role<span>Profiles</span>
        </button>
        <button>
          Build an agent team<span>Teams</span>
        </button>
        <button>
          Follow a run<span>Progress</span>
        </button>
        <button>
          Review an artifact<span>Results</span>
        </button>
      </div>
    </section>
  );
}
