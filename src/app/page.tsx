import Link from "next/link";
import { subjects } from "@/data/subjects";

export default function HomePage() {
  const totalQuestions = subjects.reduce((acc, s) => acc + s.totalQuestions, 0);
  const activeSubjects = subjects.filter((s) => s.categories.length > 0).length;

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>AI-Powered Interview Preparation</span>
        </div>
        <h1 className="hero-title">
          Ace Your Next
          <br />
          <span className="hero-title-gradient">Software Engineer Interview</span>
        </h1>
        <p className="hero-subtitle">
          AI-curated interview questions with structured, in-depth answers across
          all major tech stacks. Your one-stop last-minute revision hub.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{subjects.length}</div>
            <div className="hero-stat-label">Subjects</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{totalQuestions}+</div>
            <div className="hero-stat-label">Questions</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{activeSubjects}</div>
            <div className="hero-stat-label">Active Courses</div>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="subjects-section">
        <div className="section-header">
          <h2 className="section-title">Choose Your Subject</h2>
        </div>
        <div className="subjects-grid">
          {subjects.map((subject) => {
            const hasContent = subject.categories.length > 0;
            const CardWrapper = hasContent ? Link : "div";

            return (
              <CardWrapper
                key={subject.id}
                href={hasContent ? `/subjects/${subject.slug}` : "#"}
                className="subject-card"
                style={
                  {
                    "--card-gradient": subject.gradient,
                  } as React.CSSProperties
                }
              >
                <div
                  className="subject-card-icon"
                  style={{
                    background: `${subject.color}15`,
                    borderColor: `${subject.color}30`,
                  }}
                >
                  {subject.icon}
                </div>
                <div>
                  <h3 className="subject-card-title">{subject.title}</h3>
                  <p className="subject-card-tagline">{subject.tagline}</p>
                </div>
                <div className="subject-card-meta">
                  <span className="subject-card-badge">{subject.difficulty}</span>
                  {subject.totalQuestions > 0 && (
                    <span className="subject-card-questions">
                      {subject.totalQuestions} questions
                    </span>
                  )}
                </div>
                {hasContent ? (
                  <div className="subject-card-cta">
                    <span>Explore now</span>
                    <span>→</span>
                  </div>
                ) : (
                  <div className="coming-soon-overlay">
                    <span className="coming-soon-tag">Coming Soon</span>
                  </div>
                )}
              </CardWrapper>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <p>
          Built with ✨ AI-powered content curation ·{" "}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </>
  );
}
