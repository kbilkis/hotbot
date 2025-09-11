import React from "react";

export default function LandingPage(): React.ReactElement {
  return (
    <div className="landing-page">
      <section className="hero">
        <h1>Git Messaging Scheduler</h1>
        <p>Automated pull request notifications for your team</p>
        <button className="cta-button">Get Started</button>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature">
            <h3>Git Integration</h3>
            <p>Connect GitHub, GitLab, and Bitbucket</p>
          </div>
          <div className="feature">
            <h3>Messaging Platforms</h3>
            <p>Send notifications to Slack, Teams, and Discord</p>
          </div>
          <div className="feature">
            <h3>Flexible Scheduling</h3>
            <p>Configure custom cron schedules for your team</p>
          </div>
        </div>
      </section>
    </div>
  );
}
