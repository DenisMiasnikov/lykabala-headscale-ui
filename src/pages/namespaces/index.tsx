import {useCallback} from "react";
import type { GetServerSideProps } from "next";
import {UpdateNamespace} from "@/features/namespaces"
import {CreateAuthKey} from "@/features/authKey";
import {DeleteNamespace} from "@/features/namespaces/ui/deleteNameSpace/DeleteNamespace";
import {useNamespaceList} from "@/entities/namespace/model";
import { NameSpaceCard } from "@/entities/namespace";
import { Page, Card } from "@/shared/ui";
import { getAuthRedirect } from "@/shared/lib";

import styles from "./namespaces.module.css";


export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;
  return { props: {} };
};

export default function NamespacesPage() {
  const {data: namespaces, isPending, isError, error } = useNamespaceList()

  const renderActions = useCallback((row) => {
    return (
      <>
        <UpdateNamespace namespace={row} />
        <CreateAuthKey />
        <DeleteNamespace namespace={row} />
      </>
    )
  }, [namespaces])

  if (isPending) return (
    <div className="page">Loading...</div>
  )

  if (isError) return (
    <div className="page">{error.message}</div>
  )

  return (
    <Page title={'Headscale Control'} subtitle={'Manage namespaces'}>
      {error && <div className="error">{error.message}</div>}
      <Card
        title={'Namespaces'}
        rightAction={
          <UpdateNamespace />
        }
      >
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
