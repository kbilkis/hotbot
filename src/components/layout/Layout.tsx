import React from "react";
import { Link } from "react-router-dom";

import AuthButton from "../auth/AuthButton";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="app-layout">
      <header>
        <nav>
          <div className="logo">
            <Link to="/">
              <img
                src="/images/hotbot-l.svg"
                alt="HotBot"
                className="logo-image"
              />
            </Link>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <AuthButton />
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer>
        <div className="container">
          <p>&copy; 2025 HotBot. Never wait for a code review again.</p>
        </div>
      </footer>
    </div>
  );
}
