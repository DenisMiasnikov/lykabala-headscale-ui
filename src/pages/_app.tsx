import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Toolbar from "../shared/ui/toolbar/Toolbar";
import styles from "../shared/ui/toolbar/toolbar.module.css";
import {Layout} from "../shared/ui/layout/Layout";

import "../styles/globals.css";

const navItems = [
  { href: "/machines", label: "Machines" },
  { href: "/namespaces", label: "Namespaces" },
  { href: "/users", label: "Users" },
  { href: "/apikeys", label: "Api Keys" },
  { href: "/policy", label: "Policy" },
];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/check-auth", { method: "POST" })
      .then((res) => setLoggedIn(res.ok))
      .catch(() => setLoggedIn(false));
  }, []);

  // async function handleLogout() {
  //   await fetch("/api/logout", { method: "POST" });
  //   window.location.href = "/login";
  // }

  if (!loggedIn && router.pathname !== "/login") {
    return <Component {...pageProps} />;
  }

  const isLoginPage = router.pathname === "/login";
  const showNavbar = loggedIn && !isLoginPage;

  return (
    <Layout>
      {showNavbar && (
        <Toolbar navItems={navItems}/>
      )}

      <Component {...pageProps} />

      {/*<footer className={styles.footer}>*/}
      {/*  © 2026 Apple Clone. All rights reserved.*/}
      {/*</footer>*/}
    </Layout>
  );
}
