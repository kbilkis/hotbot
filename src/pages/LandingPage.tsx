import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function LandingPage(): React.ReactElement {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;

      document.documentElement.style.setProperty("--mouse-x", `${x}%`);
      document.documentElement.style.setProperty("--mouse-y", `${y}%`);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Never miss a code review again.</h1>
            <p>Automate pull request nudges across your tools.</p>
            <div className="hero-buttons">
              <Link to="/dashboard">
                <button className="cta-primary">Schedule nudges</button>
              </Link>
              <button className="cta-secondary">Learn more</button>
            </div>
            <p className="hero-subtitle">Free trial - No credit card</p>
          </div>
          <div className="hero-visual">
            <div className="schedule-builder">
              <div className="builder-header">
                <span>Schedule Builder</span>
                <div className="toggle-switch"></div>
              </div>
              <div className="smart-rules">
                <h4>Smart Rules</h4>
                <div className="rule-grid">
                  <div className="rule-block orange"></div>
                  <div className="rule-block blue"></div>
                  <div className="rule-block orange"></div>
                  <div className="rule-block blue"></div>
                  <div className="rule-block orange"></div>
                  <div className="rule-block blue"></div>
                  <div className="rule-block orange"></div>
                  <div className="rule-block blue"></div>
                </div>
              </div>
              <div className="frequency-section">
                <h4>Frequency</h4>
                <p>Weekly on Mon, Wed, Fri at 10 AM (every 0 • YYYY-MM-DD)</p>
              </div>
              <div className="conditions-section">
                <h4>Conditions</h4>
                <div className="condition-item">
                  <span>label: CRITICAL</span>
                  <div className="toggle-switch active"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="hero-title">
            How
            <img
              src="/images/hotbot-h.svg"
              alt="HotBot"
              className="logo-image-inline"
            />
            Works
          </h2>

          <div className="steps">
            <div className="step">
              <div className="step-icon-circle">
                <div className="step-icon">🔗</div>
              </div>
              <h3>Connect tools</h3>
              <p>
                To help you get nudge a good review mood tired little interested
                has lorem and amete to alto the border amid your athletes.
              </p>
            </div>

            <div className="step">
              <div className="step-icon-circle">
                <div className="step-icon">⚙️</div>
              </div>
              <h3>Configure smart rules</h3>
              <p>
                To help you get nudge a good review mood tired little interested
                has lorem and amete to alto the border amid your athletes.
              </p>
            </div>

            <div className="step">
              <div className="step-icon-circle">
                <div className="step-icon">🚀</div>
              </div>
              <h3>Ship faster</h3>
              <p>
                To help you get nudge a good review mood tired little interested
                has lorem and amete to alto the border amid your athletes.
              </p>
            </div>
          </div>

          <div className="integration-logos">
            <div className="logo-item github">
              <img
                src="/images/providers/github/GitHub_Lockup_Dark.svg"
                alt="GitHub"
              />
            </div>
            <div className="logo-item bitbucket">
              <img
                src="/images/providers/bitbucket/Bitbucket_attribution_light.svg"
                alt="BitBucket"
              />
            </div>
            <div className="logo-item slack">
              <img
                src="/images/providers/slack/SLA-Slack-from-Salesforce-logo.png"
                alt="Slack"
              />
            </div>
            <div className="logo-item gitlab">
              <img
                src="/images/providers/gitlab/gitlab-logo-100-rgb.svg"
                alt="GitLab"
              />
            </div>
            <div className="logo-item teams">
              <img
                src="/images/providers/teams/icons8-microsoft-teams.svg"
                alt="GitLab"
              />
            </div>
            <div className="logo-item discord">
              <img
                src="/images/providers/discord/Discord-Logo-Blurple.svg"
                alt="Discord"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Powerful Features, Simple Interface</h2>
          <p className="section-subtitle">
            Everything you need to streamline your code review process.
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Customizable Rules</h3>
              <p>
                Create flexible scheduling rules with cron expressions, custom
                filters, and team-specific configurations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Flexible Scheduling</h3>
              <p>
                Schedule notifications at optimal times for your team across
                different time zones and working hours.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Integration</h3>
              <p>
                Seamlessly connect with GitHub, GitLab, Bitbucket, Slack, Teams,
                and Discord for comprehensive workflow coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial">
        <div className="container">
          <div className="testimonial-content">
            <blockquote>
              {`"HotBot cut down our review response time by 60%. We're getting
              reviews faster and shipping features more consistently than ever
              before."`}
            </blockquote>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <div className="author-name">Alex Chen</div>
                <div className="author-title">
                  Engineering Manager, TechCorp
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <div className="container">
          <h2>Simple, transparent pricing</h2>
          <p className="section-subtitle">
            {`Choose the plan that fits your team's needs.`}
          </p>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">
                $0<span>/month</span>
              </div>
              <p>Get started with basic notifications</p>
              <ul className="features-list">
                <li>✓ 1 git provider (GitHub, GitLab, or Bitbucket)</li>
                <li>✓ 1 messaging provider (Slack, Discord, or Teams)</li>
                <li>✓ 1 notification schedule</li>
                <li>✓ Daily notifications minimum</li>
                <li>✓ Community support</li>
              </ul>
              <button className="pricing-button secondary">Get started</button>
            </div>

            <div className="pricing-card featured">
              <div className="popular-badge">Most Popular</div>
              <h3>Pro</h3>
              <div className="price">
                $15<span>/month</span>
              </div>
              <p>Perfect for growing teams</p>
              <ul className="features-list">
                <li>✓ Unlimited git providers</li>
                <li>✓ Unlimited messaging providers</li>
                <li>✓ Unlimited notification schedules</li>
                <li>✓ Any frequency (hourly, daily, etc.)</li>
                <li>✓ Escalation rules</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="pricing-button primary">
                Start free trial
              </button>
            </div>

            <div className="pricing-card">
              <h3>Enterprise</h3>
              <div className="price">Custom</div>
              <p>For large organizations</p>
              <ul className="features-list">
                <li>✓ Everything in Pro</li>
                <li>✓ SSO integration</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Custom integrations</li>
                <li>✓ Dedicated support</li>
              </ul>
              <button className="pricing-button secondary">
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
