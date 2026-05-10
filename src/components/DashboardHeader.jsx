const DashboardHeader = () => (
  <section className="hero-card">
    <div>
      <p className="eyebrow">HR Onboarding Buddy</p>
      <h1>AI-guided onboarding for new hires</h1>
      <p className="hero-copy">
        Guide joinees through onboarding, validate documents automatically, and answer company policy questions with voice-enabled AI.
      </p>
    </div>
    <div className="hero-metrics">
      <div className="metric-card">
        <span>92%</span>
        <p>Document accuracy</p>
      </div>
      <div className="metric-card">
        <span>4.8/5</span>
        <p>New hire satisfaction</p>
      </div>
      <div className="metric-card">
        <span>18 min</span>
        <p>Average completion time</p>
      </div>
    </div>
  </section>
)

export default DashboardHeader
