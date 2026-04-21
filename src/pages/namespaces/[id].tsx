import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "@/shared/lib/auth/requireAuth";
import {
  type NamespaceDetailsProps,
  type NamespaceDetails,
  NameSpaceCard,
} from "@/entities/namespace";
import {CreateAuthKey} from "@/features/authKey";
import { AuthKeysTable } from "@/entities/authKey";
import {DeleteNamespace} from "@/features/namespaces/ui/deleteNameSpace/DeleteNamespace";
import {Button, Page} from "@/shared";
import {useRouter} from "next/router";

export default function NamespaceDetails({ id }: NamespaceDetailsProps) {
  const [details, setDetails] = useState<NamespaceDetails | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const route = useRouter();

  const goBack = () => {
    route.push('/namespaces')
  }

  async function loadDetails() {
    setError("");
    try {
      // Fetch all namespaces and find the one with matching ID
      const res = await fetch("/api/internal/namespaces");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load namespaces");
        return;
      }
      const namespace = data.namespaces?.find(
        (ns: { id: string }) => ns.id === id,
      );
      if (!namespace) {
        setError("Namespace not found");
        return;
      }
      setDetails(namespace);
    } catch (err) {
      setError("Failed to load namespace");
    }
  }

  useEffect(() => {
    loadDetails();
  }, [id]);

  const renderActions = () => {
    return (
      <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
        <div
          style={{display: "flex", alignItems: "center", marginTop: 24, gap: '16px'}}
        >
          <CreateAuthKey
            onSuccess={(key) => {
              setMessage(
                `Key generated for ${key.user?.name || "namespace"}`,
              );
            }}
          />
          <DeleteNamespace
            namespace={details}
            onError={setError}
            onSuccess={
              (message) => {
                setMessage(message);
                loadDetails();
              }
            }
          />
        </div>

        <div className="card" style={{marginTop: 16}}>
          <h2 className="title" style={{
            fontSize: '22px',
            margin: 'unset',
            color: '#222222',
            fontWeight: '400',
          }}>
            Pre-Auth Keys
          </h2>
          <AuthKeysTable/>
        </div>
      </div>
    )
  }

  return (
    <Page title={'Namespace Details'} subtitle={details?.name}>
      {error ? <div className="error">{error}</div> : null}
      {message ? (
        <div className="pill online" style={{marginBottom: 16}}>
          {message}
        </div>
      ) : null}

      {details ? (
        <>
          <NameSpaceCard
            details={details}
            actions={renderActions}
            rightAction={
              () => (
                <div style={{alignSelf:'end'}}>
                  <Button mode={'primary'} label={'Back'} onClick={goBack}/>
                </div>
              )
            }
            full
          />
        </>
      ) : (
        <div className="subtitle">Loading...</div>
      )}
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps<
  NamespaceDetailsProps
> = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;

  return {
    props: {
      id: String(context.params?.id || ""),
    },
  };
};
