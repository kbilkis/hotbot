import React from "react";

export default function Dashboard(): React.ReactElement {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <section className="providers">
          <h2>Connected Providers</h2>
          <p>Connect your git and messaging providers</p>
        </section>

        <section className="cron-jobs">
          <h2>Cron Jobs</h2>
          <p>Manage your scheduled notifications</p>
        </section>
      </div>
    </div>
  );
}
