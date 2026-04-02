import "../styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/machines", label: "Machines" },
  { href: "/namespaces", label: "Namespaces" },
  { href: "/users", label: "Users" },
  { href: "/apikeys", label: "Api Keys" },
  { href: "/policy", label: "Policy" },
];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/check-auth", { method: "POST" })
      .then((res) => setLoggedIn(res.ok))
      .catch(() => setLoggedIn(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (!loggedIn && router.pathname !== "/login") {
    return <Component {...pageProps} />;
  }

  const isLoginPage = router.pathname === "/login";
  const showNavbar = loggedIn && !isLoginPage;

  return (
    <div>
      {showNavbar && (
        <>
          <nav className="navbar">
            <div className="nav-brand">Lykabala UI</div>
            <div className="nav-links">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${router.pathname.startsWith(link.href) ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="nav-right">
              <button className="button secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
            <button
              className={`hamburger ${mobileMenuOpen ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </nav>
          <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
            <div className="mobile-menu-content">
              <div className="mobile-nav-links">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${router.pathname.startsWith(link.href) ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mobile-nav-right">
                <button className="button secondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div
            className={`mobile-backdrop ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        </>
      )}
      <Component {...pageProps} />
    </div>
  );
}
