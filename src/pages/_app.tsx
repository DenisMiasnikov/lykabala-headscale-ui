import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toolbar, Layout, LogOutIcon } from "@/shared/ui";

import "@/styles/globals.css";
import { hasServers } from "@/shared/lib/storage";

const navItems = [
  { href: "/machines", label: "Machines" },
  { href: "/namespaces", label: "Namespaces" },
  { href: "/users", label: "Users" },
  { href: "/apikeys", label: "Api Keys" },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {

  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hasEnvConfig, setHasEnvConfig] = useState(false);

  useEffect(() => {
    fetch("/api/internal/check-auth", { method: "POST" })
      .then((res) => {
        setLoggedIn(res.ok);
        if (res.ok) {
          const isEnvAuth = res.headers.get("X-Env-Auth") === "true";
          if (isEnvAuth) {
            setHasEnvConfig(true);
          }
        }
      })
      .catch(() => setLoggedIn(false))
      .finally(() => setChecked(true));
  }, [router.pathname]);

  useEffect(() => {
    if (!checked) return;

    if (router.pathname === "/setup") {
      return;
    }

    const hasLocalServers = hasServers();
    if (hasLocalServers || hasEnvConfig || loggedIn) {
      return;
    }

    router.push("/setup");
  }, [checked, hasEnvConfig, router.pathname, loggedIn]);

  async function handleLogout() {
    await fetch("/api/internal/logout", { method: "POST" });
    router.push("/login");
  }

  const isLoginPage = router.pathname === "/login";
  const isSetupPage = router.pathname === "/setup";
  const showNavbar = loggedIn && !isLoginPage && !isSetupPage;

  return (
    <Layout>
      <QueryClientProvider client={queryClient}>
      {showNavbar && (
        <Toolbar navItems={navItems} right={<div onClick={handleLogout}><LogOutIcon /></div>}/>
      )}
      <div className={`body ${showNavbar ? 'withToolBar' : ''}`}>
        <Component {...pageProps} />
      </div>

      </QueryClientProvider>
    </Layout>
  );
}
