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
            <h1>Never let a pull request fall through the cracks.</h1>
            <p>
              Daily, standup-ready summaries and smart escalation that keep
              reviews moving.
            </p>
            <div className="hero-buttons">
              <Link to="/dashboard">
                <button className="cta-primary">Start integrating</button>
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-split">
              <div className="slack-case-image">
                <img
                  src="/images/landing/slack-case.png"
                  alt="Slack PR digest showing daily pull request summaries with review status and quick actions"
                  className="slack-screenshot"
                />
              </div>
              <div className="analytics-tiles">
                <div className="stat-tile">
                  <div className="stat-label">Median review time</div>
                  <div className="stat-value">↓ 38%</div>
                </div>
                <div className="stat-tile">
                  <div className="stat-label">Stale PRs</div>
                  <div className="stat-value">↓ 52%</div>
                </div>
                <div className="stat-tile">
                  <div className="stat-label">Read rate</div>
                  <div className="stat-value">86%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="integrations">
        <div className="container">
          <h2>Works with your stack</h2>
          <div className="integrations-grid-landing">
            <div className="integration-item">
              <img
                src="/images/providers/github/GitHub_Lockup_Dark.svg"
                alt="GitHub"
              />
            </div>
            <div className="integration-item">
              <img
                src="/images/providers/gitlab/gitlab-logo-100-rgb.svg"
                alt="GitLab"
              />
            </div>
            <div className="integration-item">
              <img
                src="/images/providers/bitbucket/Bitbucket_attribution_light.svg"
                alt="Bitbucket"
              />
              <div className="coming-soon-flair">Coming Soon</div>
            </div>
            <div className="integration-item">
              <img
                src="/images/providers/slack/SLA-Slack-from-Salesforce-logo.png"
                alt="Slack"
              />
            </div>
            <div className="integration-item">
              <img
                src="/images/providers/discord/Discord-Logo-Blurple.svg"
                alt="Discord"
              />
            </div>
            <div className="integration-item">
              <img
                src="/images/providers/teams/icons8-microsoft-teams.svg"
                alt="Microsoft Teams"
              />
              <div className="coming-soon-flair">Coming Soon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="value-proposition">
        <div className="container">
          <h2>Ship faster by unblocking reviews.</h2>
          <div className="value-grid">
            <div className="value-item">
              <div className="value-icon">📅</div>
              <h3>Daily PR summaries before standup</h3>
            </div>
            <div className="value-item">
              <div className="value-icon">🎯</div>
              <h3>Targeted nudges, not noise</h3>
            </div>
            <div className="value-item">
              <div className="value-icon">⚙️</div>
              <h3>Configurable escalation that respects team norms</h3>
            </div>
          </div>
          <div className="before-after-chart">
            <div className="chart-title">Review Time Trends</div>
            <div className="chart-container">
              <div className="chart-bar before">
                <div className="bar-label">Before</div>
                <div className="bar" style={{ height: "80px" }}></div>
                <div className="bar-value">3.2 days</div>
              </div>
              <div className="chart-bar after">
                <div className="bar-label">After</div>
                <div className="bar" style={{ height: "30px" }}></div>
                <div className="bar-value">1.2 days</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product in Context Section */}
      <section className="product-context">
        <div className="container">
          <h2>Designed to be read in seconds and acted on immediately.</h2>
          <div className="context-grid">
            <div className="context-card">
              <div className="context-header">Morning Slack Digest</div>
              <div className="slack-digest-full">
                <div className="digest-item">
                  <div className="avatar">MK</div>
                  <div className="details">
                    <div className="title">Update API endpoints</div>
                    <div className="meta">3 days old • @sarah @alex</div>
                  </div>
                  <div className="actions">
                    <button>Review</button>
                    <button>Approve</button>
                  </div>
                </div>
                <div className="digest-item">
                  <div className="avatar">JL</div>
                  <div className="details">
                    <div className="title">Fix mobile layout</div>
                    <div className="meta">1 day old • Ready for review</div>
                  </div>
                  <div className="actions">
                    <button>Review</button>
                    <button>Approve</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="context-card">
              <div className="context-header">Smart Escalation</div>
              <div className="escalation-example">
                <div className="escalation-message">
                  <span className="bot-icon">🤖</span>
                  <div className="message-content">
                    <div className="message-text">
                      {`PR "Fix auth bug" has been waiting 3 days`}
                    </div>
                    <div className="message-mentions">
                      Escalating to @team-lead @engineering-manager
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="context-card">
              <div className="context-header">Dashboard Overview</div>
              <div className="dashboard-preview">
                <div className="dashboard-stat">
                  <div className="stat-number">
                    7 <span className="trend">↓3</span>
                  </div>
                  <div className="stat-label">Awaiting Review</div>
                </div>
                <div className="mini-sparkline">
                  <div
                    className="sparkline-bar"
                    style={{ height: "20px" }}
                  ></div>
                  <div
                    className="sparkline-bar"
                    style={{ height: "15px" }}
                  ></div>
                  <div
                    className="sparkline-bar"
                    style={{ height: "25px" }}
                  ></div>
                  <div
                    className="sparkline-bar"
                    style={{ height: "10px" }}
                  ></div>
                  <div
                    className="sparkline-bar"
                    style={{ height: "8px" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Connect Git repos</h3>
              <p>
                Link your repositories and grant necessary permissions for PR
                monitoring.
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Pick channels and standup time</h3>
              <p>
                Choose Slack channels and set your team&apos;s preferred
                notification schedule.
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Enable escalation rules</h3>
              <p>
                Configure smart escalation thresholds and stakeholder
                notifications.
              </p>
            </div>
          </div>

          <div className="integrations-demo-image">
            <img
              src="/images/landing/integrations-demo.png"
              alt="Integration setup showing connected GitHub repositories and Slack channels with configuration options"
              className="integrations-screenshot"
            />
          </div>

          <div className="flow-diagram">
            <div className="flow-step">
              <div className="flow-icon github">
                <img
                  src="/images/providers/github/GitHub_Invertocat_Dark.svg"
                  alt="GitHub icon"
                />
              </div>
              <div className="flow-label">GitHub</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <img
                src="/images/hotbot.svg"
                alt="HotBot logo"
                className="integrations-screenshot"
              />
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon slack">
                <img
                  src="/images/providers/slack/SLA-appIcon-iOS.png"
                  alt="Slack Icon"
                />
              </div>
            </div>
          </div>

          <div className="cta-repeat">
            <button className="cta-primary">
              Add to your favorite messaging platform
            </button>
          </div>
        </div>
      </section>

      {/* Features for Engineers Section */}
      <section className="features-engineers">
        <div className="container">
          <h2>Features for engineers</h2>
          <div className="features-list">
            <div className="feature-bullet">
              <span className="bullet">•</span>
              <span>Daily standup summaries (cron/zone aware)</span>
            </div>
            <div className="feature-bullet">
              <span className="bullet">•</span>
              <span>
                Smart filters: Draft/WIP/label exclusions, reviewer-aware
              </span>
            </div>
            <div className="feature-bullet">
              <span className="bullet">•</span>
              <span>Escalation tiers with stakeholder mentions</span>
            </div>
            <div className="feature-bullet">
              <span className="bullet">•</span>
              <span>No-noise defaults; configurable thresholds</span>
            </div>
          </div>

          <div className="rule-builder-card">
            <div className="rule-header">Rule Builder</div>
            <div className="rule-content">
              <div className="rule-section">
                <span className="rule-label">Frequency:</span>
                <div className="rule-chip">Daily 9:00 AM</div>
              </div>
              <div className="rule-section">
                <span className="rule-label">Conditions:</span>
                <div className="rule-chips">
                  <div className="rule-chip">!draft</div>
                  <div className="rule-chip">!wip</div>
                  <div className="rule-chip">age 1d</div>
                </div>
              </div>
              <div className="rule-section">
                <span className="rule-label">Escalation:</span>
                <div className="rule-chips">
                  <div className="rule-chip">@team-lead</div>
                  <div className="rule-chip">@manager</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof">
        <div className="container">
          <div className="testimonial-content">
            <blockquote>
              &quot;PRs stopped languishing—reviews happen before lunch.&quot;
            </blockquote>
            <div className="testimonial-author">
              <div className="author-avatar">
                <img
                  src="/images/landing/hero.png"
                  alt="Staff Engineer avatar"
                  className="avatar-image"
                />
              </div>
              <div className="author-info">
                <div className="author-name">Staff Engineer</div>
                <div className="author-title">Fintech</div>
              </div>
            </div>
          </div>

          <div className="case-study-card">
            <div className="case-study-header">Time to First Review</div>
            <div className="case-study-chart">
              <div className="chart-section">
                <div className="chart-label">Before</div>
                <div className="chart-value">2.8 days</div>
                <div className="chart-bar-bg">
                  <div
                    className="chart-bar-fill before"
                    style={{ width: "80%" }}
                  ></div>
                </div>
              </div>
              <div className="chart-section">
                <div className="chart-label">After</div>
                <div className="chart-value">1.1 days</div>
                <div className="chart-bar-bg">
                  <div
                    className="chart-bar-fill after"
                    style={{ width: "35%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="analytics-slice">
        <div className="container">
          <h2>Track what matters</h2>
          <div className="analytics-tiles-grid">
            <div className="analytics-tile">
              <div className="tile-value">
                1.2 days <span className="trend-arrow">↓</span>
              </div>
              <div className="tile-label">Median review time</div>
            </div>
            <div className="analytics-tile">
              <div className="tile-value">
                3 <span className="trend-arrow">↓</span>
              </div>
              <div className="tile-label">PRs awaiting review</div>
            </div>
            <div className="analytics-tile">
              <div className="tile-value">
                2 <span className="trend-arrow">→</span>
              </div>
              <div className="tile-label">Escalations this week</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <div className="container">
          <h2>Simple, transparent pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">
                $0<span>/month</span>
              </div>
              <p>Start free—full features for a small team</p>
              <ul className="features-list">
                <li>✓ 1 git provider (GitHub, GitLab, or Bitbucket)</li>
                <li>✓ 1 messaging provider (Slack, Discord, or Teams)</li>
                <li>✓ 1 notification schedule</li>
                <li>✓ Daily notifications minimum</li>
                <li>✓ Community support</li>
              </ul>
              <Link to="/dashboard">
                <button className="pricing-button secondary">
                  Get started
                </button>
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="popular-badge">Most Popular</div>
              <h3>Pro</h3>
              <div className="price">
                $15<span>/month</span>
              </div>
              <p>Scale by repos/channels, not surprises</p>
              <ul className="features-list">
                <li>✓ Unlimited git providers</li>
                <li>✓ Unlimited messaging providers</li>
                <li>✓ Unlimited notification schedules</li>
                <li>✓ Any frequency (hourly, daily, etc.)</li>
                <li>✓ Escalation rules</li>
                <li>✓ Priority support</li>
              </ul>
              <Link to="/dashboard">
                <button className="pricing-button primary">
                  Start free trial
                </button>
              </Link>
            </div>

            <div className="pricing-card">
              <h3>Enterprise</h3>
              <div className="price">Custom</div>
              <p>Cancel anytime</p>
              <ul className="features-list">
                <li>✓ Everything in Pro</li>
                <li>✓ SSO integration</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Custom integrations</li>
                <li>✓ Dedicated support</li>
              </ul>
              <a href="mailto:kasparas@bilkis.lt">
                <button className="pricing-button secondary">
                  Contact sales
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <h2>Frequently asked questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do you control noise?</h3>
              <p>
                Smart defaults exclude drafts, WIP PRs, and bot-generated
                content. Fully configurable.
              </p>
            </div>
            <div className="faq-item">
              <h3>What permissions do you need?</h3>
              <p>
                Read-only access to repositories and PR metadata. No code access
                required.
              </p>
            </div>
            <div className="faq-item">
              <h3>Do you create false positives?</h3>
              <p>
                Built-in filters for draft status, labels, and reviewer
                assignments minimize noise.
              </p>
            </div>
            <div className="faq-item">
              <h3>How customizable are the rules?</h3>
              <p>
                Full control over timing, conditions, escalation thresholds, and
                stakeholder notifications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
