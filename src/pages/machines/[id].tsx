import React, {useEffect, useState, useCallback} from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../../shared/lib/auth/requireAuth";
import { RenameMachine } from "../../features/machines/ui/renameMachine/RenameMachine";
import { UpdateMachineTags } from "../../features/machines/ui/updateMachineTags/UpdateMachineTags";
import { UpdateMachineRoutes } from "../../features/machines/ui/updateMachineRoutes/UpdateMachineRoutes";
import { ExpireMachine } from "../../features/machines/ui/expireMachine/ExpireMachine";
import { BackFlipIps } from "../../features/machines/ui/backfilips/BackFlipIps";
import type {
  MachineDetailsProps,
  MachineDetails,
} from "../../entities/machine/types";
import {Page} from "../../shared/ui/page/Page";
import MachineCard from "../../entities/machine/ui/machine-card/MachineCard";
import {Card} from "../../shared/ui/card/Card";

export default function MachineDetails({ id }: MachineDetailsProps) {
  const [details, setDetails] = useState<MachineDetails | null>(null);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  async function loadDetails() {
    const res = await fetch(`/api/machines/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load machine");
      return;
    }
    setDetails(data);
  }

  useEffect(() => {
    loadDetails();
  }, []);

  const actions = useCallback((details, onSuccess, onError) => {
    return (
      <>
        <RenameMachine
          data={details}
          onError={onError}
          onSuccess={onSuccess}
        />

        <UpdateMachineTags
          data={details}
          onError={onError}
          onSuccess={onSuccess}
        />

        <UpdateMachineRoutes
          data={details}
          onError={onError}
          onSuccess={onSuccess}
        />

        <BackFlipIps
          onSuccess={onSuccess}
          onError={onError}
        />

        <ExpireMachine
          id={details.id}
          onSuccess={onSuccess}
          onError={onError}
        />
      </>
    )
  }, [])


  const handleSuccess = useCallback((message: string) => {
    loadDetails();
    setActionMessage(message);
  }, [loadDetails, setActionMessage])

  return (
      <Page title={`${details?.givenName} details`} subtitle={`Machine ID: ${details?.id}`}>
        {details && (
          <Card>
            {error ? <div className="error">{error}</div> : null}
            {actionMessage ? (
              <div className="pill online" style={{ marginTop: 12 }}>
                {actionMessage}
              </div>
            ) : null}

            <MachineCard details={details} actions={() => actions(details, handleSuccess, setError)}/>
          </Card>
        )}
      </Page>
  );
}

export const getServerSideProps: GetServerSideProps<
  MachineDetailsProps
> = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;

  return {
    props: {
      id: String(context.params?.id || ""),
    },
  };
};
