import React from "react";
import { Link } from "react-router-dom";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="app-layout">
      <header>
        <div className="container">
          <nav>
            <div className="logo">Git Messaging Scheduler</div>
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>

      <footer>
        <div className="container">
          <p>&copy; 2024 Git Messaging Scheduler. Built for developers.</p>
        </div>
      </footer>
    </div>
  );
}
