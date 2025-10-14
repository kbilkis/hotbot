import * as styles from "../../styles/landing/advanced.css";
import { container } from "../../styles/landing/base.css";

// This component contains the remaining sections that are less critical for initial load
export default function AdvancedSections() {
  return (
    <>
      {/* Smart Git Webhooks Section */}
      <section className={styles.smartWebhooks}>
        <div className={container}>
          <div className={styles.featureHeader}>
            <h2 className={styles.sectionTitle}>Smart Git Webhooks</h2>
            <div className={styles.comingSoonBadge}>Coming Soon</div>
          </div>
          <p className={styles.featureSubtitle}>
            Keep your messaging channels clean with intelligent PR tracking that
            updates in real-time
          </p>

          <div className={styles.webhooksDemo}>
            <div className={styles.demoDescription}>
              <h3>One message per PR. Always up-to-date.</h3>
              <div className={styles.webhooksFeatures}>
                <div className={styles.webhookFeature}>
                  <div className={styles.featureIcon}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                  </div>
                  <span>Live status updates as PRs progress</span>
                </div>
                <div className={styles.webhookFeature}>
                  <div className={styles.featureIcon}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18l-2 13H5L3 6z" />
                      <path d="m19 6-3-6H8L5 6" />
                    </svg>
                  </div>
                  <span>Auto-cleanup when PRs are merged/closed</span>
                </div>
                <div className={styles.webhookFeature}>
                  <div className={styles.featureIcon}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <span>Rich context: builds, tests, reviewers</span>
                </div>
                <div className={styles.webhookFeature}>
                  <div className={styles.featureIcon}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <span>Instant notifications, zero noise</span>
                </div>
              </div>
            </div>

            <div className={styles.slackMockup}>
              <div className={styles.slackHeader}>
                <div className={styles.slackChannel}># engineering-prs</div>
                <div className={styles.slackMembers}>👥 12 members</div>
              </div>

              <div className={styles.slackMessages}>
                <div className={styles.slackMessage}>
                  <div className={styles.messageAvatar}>
                    <img src="/images/hotbot.svg" alt="HotBot" />
                  </div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageHeader}>
                      <span className={styles.botName}>HotBot</span>
                      <span className={styles.messageTime}>2:14 PM</span>
                    </div>
                    <div className={styles.prCard}>
                      <div className={styles.prHeader}>
                        <a className={styles.prTitle}>
                          🔧 Fix authentication timeout handling
                        </a>
                        <div className={styles.prMeta}>
                          <span className={styles.prAuthor}>by @sarah-dev</span>
                          <span className={styles.prNumber}>#1247</span>
                        </div>
                      </div>
                      <div className={styles.prDescription}>
                        Increases timeout from 30s to 60s and adds proper retry
                        logic for auth failures. Fixes the issue where users get
                        logged out during long operations.
                      </div>
                      <div className={styles.prReviewers}>
                        <span className={styles.reviewersLabel}>
                          Reviewers:
                        </span>
                        <span className={styles.reviewer}>@alex-lead</span>
                        <span className={styles.reviewer}>@mike-senior</span>
                      </div>
                      <div className={styles.prStatus}>
                        <div className={styles.statusItemSuccess}>
                          <span className={styles.statusIcon}>✅</span>
                          <span>Build passed</span>
                        </div>
                        <div className={styles.statusItemSuccess}>
                          <span className={styles.statusIcon}>✅</span>
                          <span>Tests passed (47/47)</span>
                        </div>
                        <div className={styles.statusItemWarning}>
                          <span className={styles.statusIcon}>⚠️</span>
                          <span>Lint: 2 warnings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.slackMessage}>
                  <div className={styles.messageAvatar}>
                    <img src="/images/hotbot.svg" alt="HotBot" />
                  </div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageHeader}>
                      <span className={styles.botName}>HotBot</span>
                      <span className={styles.messageTime}>11:32 AM</span>
                    </div>
                    <div className={styles.prCard}>
                      <div className={styles.prHeader}>
                        <a className={styles.prTitle}>
                          ✨ Add dark mode toggle to user settings
                        </a>
                        <div className={styles.prMeta}>
                          <span className={styles.prAuthor}>by @jenny-ui</span>
                          <span className={styles.prNumber}>#1245</span>
                        </div>
                      </div>
                      <div className={styles.prDescription}>
                        Implements system preference detection and manual
                        toggle. Persists user choice in localStorage with smooth
                        transitions.
                      </div>
                      <div className={styles.prReviewers}>
                        <span className={styles.reviewersLabel}>
                          Reviewers:
                        </span>
                        <span className={styles.reviewerApproved}>
                          @sarah-dev ✅
                        </span>
                        <span className={styles.reviewer}>@design-team</span>
                      </div>
                      <div className={styles.prStatus}>
                        <div className={styles.statusItemSuccess}>
                          <span className={styles.statusIcon}>✅</span>
                          <span>Build passed</span>
                        </div>
                        <div className={styles.statusItemSuccess}>
                          <span className={styles.statusIcon}>✅</span>
                          <span>Tests passed (23/23)</span>
                        </div>
                        <div className={styles.statusItemSuccess}>
                          <span className={styles.statusIcon}>✅</span>
                          <span>Lint passed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Engineers Section */}
      <section className={styles.featuresEngineers}>
        <div className={container}>
          <h2 className={styles.sectionTitle}>Made for engineers</h2>
          <div className={styles.featuresEngineersContent}>
            <div className={styles.featuresList}>
              <div className={styles.featureBullet}>
                <span className={styles.bullet}>•</span>
                <span>Daily standup summaries (cron schedule)</span>
              </div>
              <div className={styles.featureBullet}>
                <span className={styles.bullet}>•</span>
                <span>
                  Smart filters: Draft/WIP/label exclusions, reviewer-aware
                </span>
              </div>
              <div className={styles.featureBullet}>
                <span className={styles.bullet}>•</span>
                <span>Escalation tiers with stakeholder mentions</span>
              </div>
              <div className={styles.featureBullet}>
                <span className={styles.bullet}>•</span>
                <span>No-noise defaults; configurable thresholds</span>
              </div>
            </div>

            <div className={styles.ruleBuilderCard}>
              <div className={styles.ruleHeader}>Rule Builder</div>
              <div className={styles.ruleContent}>
                <div className={styles.ruleSection}>
                  <span className={styles.ruleLabel}>Frequency:</span>
                  <div className={styles.ruleChip}>Daily 9:00 AM</div>
                </div>
                <div className={styles.ruleSection}>
                  <span className={styles.ruleLabel}>Conditions:</span>
                  <div className={styles.ruleChips}>
                    <div className={styles.ruleChip}>!draft</div>
                    <div className={styles.ruleChip}>!wip</div>
                    <div className={styles.ruleChip}>age 1d</div>
                  </div>
                </div>
                <div className={styles.ruleSection}>
                  <span className={styles.ruleLabel}>Escalation:</span>
                  <div className={styles.ruleChips}>
                    <div className={styles.ruleChip}>@team-lead</div>
                    <div className={styles.ruleChip}>@manager</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className={styles.socialProof}>
        <div className={container}>
          <div className={styles.testimonialContent}>
            <blockquote className={styles.testimonialQuote}>
              &quot;PRs stopped languishing—reviews happen before lunch.&quot;
            </blockquote>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}>
                <img
                  src="/images/landing/hero.jpg"
                  alt="Staff Engineer avatar"
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.authorInfo}>
                <div className={styles.authorName}>Staff Engineer</div>
                <div className={styles.authorTitle}>Fintech</div>
              </div>
            </div>
          </div>

          <div className={styles.caseStudyCard}>
            <div className={styles.caseStudyHeader}>Time to First Review</div>
            <div className={styles.caseStudyChart}>
              <div className={styles.chartSection}>
                <div className={styles.chartLabel}>Before</div>
                <div className={styles.chartValue}>2.8 days</div>
                <div className={styles.chartBarBg}>
                  <div
                    className={styles.chartBarFillBefore}
                    style={{ width: "80%" }}
                  ></div>
                </div>
              </div>
              <div className={styles.chartSection}>
                <div className={styles.chartLabel}>After</div>
                <div className={styles.chartValue}>1.1 days</div>
                <div className={styles.chartBarBg}>
                  <div
                    className={styles.chartBarFillAfter}
                    style={{ width: "35%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className={styles.analyticsSlice}>
        <div className={container}>
          <h2 className={styles.sectionTitle}>Track what matters</h2>
          <div className={styles.analyticsTilesGrid}>
            <div className={styles.analyticsTile}>
              <div className={styles.tileValue}>
                1.2 days <span className={styles.trendArrow}>↓</span>
              </div>
              <div className={styles.tileLabel}>Median review time</div>
            </div>
            <div className={styles.analyticsTile}>
              <div className={styles.tileValue}>
                3 <span className={styles.trendArrow}>↓</span>
              </div>
              <div className={styles.tileLabel}>PRs awaiting review</div>
            </div>
            <div className={styles.analyticsTile}>
              <div className={styles.tileValue}>
                2 <span className={styles.trendArrow}>→</span>
              </div>
              <div className={styles.tileLabel}>Escalations this week</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faq}>
        <div className={container}>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How do you control noise?</h3>
              <p className={styles.faqAnswer}>
                Smart defaults exclude drafts, WIP PRs, and bot-generated
                content. Fully configurable.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>
                What permissions do you need?
              </h3>
              <p className={styles.faqAnswer}>
                Read-only access to repositories and PR metadata. No code access
                required.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>
                Do you create false positives?
              </h3>
              <p className={styles.faqAnswer}>
                Built-in filters for draft status, labels, and reviewer
                assignments minimize noise.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>
                How customizable are the rules?
              </h3>
              <p className={styles.faqAnswer}>
                Full control over timing, conditions, escalation thresholds, and
                stakeholder notifications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
