import {useCallback, useEffect, useState} from "react";
import type { GetServerSideProps } from "next";
import {CreateNamespace, UpdateNamespace} from "@/features/namespaces"
import {CreateAuthKey} from "@/features/authKey";
import { type Namespace, NameSpaceCard } from "@/entities/namespace";
import { Button, Page, Card } from "@/shared/ui";
import { getAuthRedirect } from "@/shared/lib";

import styles from "./namespaces.module.css";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;
  return { props: {} };
};

export default function NamespacesPage() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setError("");
    try {
      const res = await fetch("/api/internal/namespaces");
      const data = await res.json();
      if (!res.ok) {
       new Error(data.error || "Failed to load namespaces");
      }
      const nsList = Array.isArray(data.namespaces) ? data.namespaces : [];
      setNamespaces(nsList);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      setError(msg);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function deleteNamespace(id: string, name: string) {
    const ok = window.confirm(`Delete namespace "${name}"? This cannot be undone.`);
    if (!ok) return;

    const res = await fetch(`/api/internal/namespaces/${id}`, {
      method: "DELETE"
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to delete namespace");
      return;
    }

    setMessage("Namespace deleted");
    await loadData();
  }

  const renderActions = useCallback((row) => {
    return (
      <>
        <UpdateNamespace
          onSuccess={() => {
            setMessage(
              `Image for ${row.user?.name || "namespace"} updated`,
            );
          }}
          namespace={row}
        />

        <CreateAuthKey
          onSuccess={(key) => {
            setMessage(
              `Key generated for ${key.user?.name || "namespace"}`,
            );
          }}
          namespaces={namespaces}
        />
        <Button
          label={'Delete'}
          mode={'danger'}
          type={'button'}
          onClick={() => deleteNamespace(row.id, row.name)}
        />
      </>
    )
  }, [namespaces])

  return (
    <Page title={'Headscale Control'} subtitle={'Manage namespaces'}>
      {error && <div className="error">{error}</div>}
      {message && (
        <div className="pill online" style={{ marginBottom: 16 }}>
          {message}
        </div>
      )}
      <Card title={'Namespaces'} rightAction={
        <CreateNamespace
          onSuccess={(msg) => {
            setMessage(msg);
            loadData();
          }}
          onError={setError}
        />
      }>
        {namespaces.length === 0 ? (
          <Card title={'No namespaces yet.'} subTitle={'Create a namespace to see namespaces appear here.'} empty={true} />
        ) : (
          <div className={styles.namespacesGrid}>
            {namespaces.map((ns) => (
              <div key={ns.id} style={{maxWidth: '360px'}}>
                <NameSpaceCard details={ns} actions={() => renderActions(ns)}/>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Page>
  )
}
