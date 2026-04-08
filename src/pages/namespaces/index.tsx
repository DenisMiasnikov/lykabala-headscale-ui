import {useCallback, useEffect, useState} from "react";
import type { GetServerSideProps } from "next";
import CreateNamespace from "../../features/namespaces/ui/createNamespace/CreateNameSpace";
import GeneratePreAuthKey from "../../features/authKey/ui/createAuthKey/CreateAuthKey";
import type { Namespace } from "../../entities/namespace/types";
import NameSpaceCard from "../../entities/namespace/ui/namespace-card/NameSpaceCard";
import {Button} from "../../shared/ui/button/Button";
import {Page} from "../../shared/ui/page/Page";
import {Card} from "../../shared/ui/card/Card";
import { getAuthRedirect } from "../../shared/lib/auth/requireAuth";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function loadData() {
    setError("");
    try {
      const res = await fetch("/api/namespaces");
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

  function startEdit(ns: Namespace, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(ns.id);
    setEditName(ns.name);
    setError("");
    setMessage("");
  }

  async function saveEdit(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }

    const res = await fetch(`/api/namespaces/${id}/rename`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmed,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to update namespace");
      return;
    }

    setEditingId(null);
    setMessage("Namespace updated");
    await loadData();
  }

  async function deleteNamespace(id: string, name: string) {
    const ok = window.confirm(`Delete namespace "${name}"? This cannot be undone.`);
    if (!ok) return;

    const res = await fetch(`/api/namespaces/${id}`, {
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
        {editingId === row.id ? (
          <>
            <Button
              label={'Save'}
              mode={'action'}
              type={'button'}
              onClick={() => setEditingId(null)}
            />
            <Button
              label={'Cancel'}
              mode={'primary'}
              type={'button'}
              onClick={() => saveEdit(row.id)}
            />
          </>
        ) : (
          <>
            <Button
              label={'Edit'}
              mode={'action'}
              type={'button'}
              onClick={(e) => startEdit(row, e)}
            />

            <GeneratePreAuthKey
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
        )}
      </>
    )
  }, [])

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
