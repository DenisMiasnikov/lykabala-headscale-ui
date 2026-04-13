import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Toolbar from "../shared/ui/toolbar/Toolbar";
import {Layout} from "../shared/ui/layout/Layout";
import LogOutIcon from "../shared/ui/icons/Icons";

import "../styles/globals.css";
import { hasServers } from "../shared/lib/storage";

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
  const [checked, setChecked] = useState(false);
  const [hasEnvConfig, setHasEnvConfig] = useState(false);

  // useEffect(() => {
  //   fetch("/api/internal/check-auth", { method: "POST" })
  //     .then((res) => {
  //       setLoggedIn(res.ok);
  //       if (res.ok) {
  //         const isEnvAuth = res.headers.get("X-Env-Auth") === "true";
  //         if (isEnvAuth) {
  //           setHasEnvConfig(true);
  //         }
  //       }
  //     })
  //     .catch(() => setLoggedIn(false))
  //     .finally(() => setChecked(true));
  // }, []);
  //
  // useEffect(() => {
  //   const hasLocalServers = hasServers();
  //   const shouldRedirectToSetup = !hasLocalServers && !hasEnvConfig && router.pathname !== "/setup";
  //   if (checked && shouldRedirectToSetup) {
  //     router.push("/setup");
  //   }
  // }, [checked, hasEnvConfig, router.pathname]);

  async function handleLogout() {
    await fetch("/api/internal/logout", { method: "POST" });
    window.location.href = "/login";
  }

  // if (!checked) {
  //   return null;
  // }

  const hasLocalServers = hasServers();
  if (!hasLocalServers && !hasEnvConfig && router.pathname !== "/setup") {
    return <Component {...pageProps} />;
  }

  if (!loggedIn && router.pathname !== "/login" && router.pathname !== "/setup") {
    return <Component {...pageProps} />;
  }

  const isLoginPage = router.pathname === "/login";
  const isSetupPage = router.pathname === "/setup";
  const showNavbar = loggedIn && !isLoginPage && !isSetupPage;

  return (
    <Layout>
      {showNavbar && (
        <Toolbar navItems={navItems} right={<div onClick={handleLogout}><LogOutIcon /></div>}/>
      )}

      <div className={`body ${showNavbar ? 'withToolBar' : ''}`}>
        <Component {...pageProps} />
      </div>

      {/*<footer className={styles.footer}>*/}
      {/*  © 2026 Apple Clone. All rights reserved.*/}
      {/*</footer>*/}
    </Layout>
  );
}
