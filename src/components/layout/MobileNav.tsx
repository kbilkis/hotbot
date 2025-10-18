import { useAuth } from "@clerk/clerk-react";
import { useState } from "preact/hooks";

import * as styles from "../../styles/layout/mobile-nav.css";
import AuthButton from "../auth/AuthButton";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <span
          className={`${styles.hamburgerLine} ${
            isOpen ? styles.hamburgerLineOpen : ""
          }`}
        ></span>
        <span
          className={`${styles.hamburgerLine} ${
            isOpen ? styles.hamburgerLineOpen : ""
          }`}
        ></span>
        <span
          className={`${styles.hamburgerLine} ${
            isOpen ? styles.hamburgerLineOpen : ""
          }`}
        ></span>
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={closeMenu} />
          <nav className={styles.mobileMenu}>
            <div className={styles.mobileMenuContent}>
              <button
                className={styles.closeButton}
                onClick={closeMenu}
                aria-label="Close navigation menu"
              >
                ✕
              </button>

              <a href="/" className={styles.mobileNavLink} onClick={closeMenu}>
                Home
              </a>
              <a
                href="/dashboard"
                className={styles.mobileNavLink}
                onClick={closeMenu}
              >
                Dashboard
              </a>
              {isSignedIn && (
                <a
                  href="/subscription"
                  className={styles.mobileNavLink}
                  onClick={closeMenu}
                >
                  Subscription
                </a>
              )}
              <div className={styles.mobileAuthSection}>
                <AuthButton />
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
