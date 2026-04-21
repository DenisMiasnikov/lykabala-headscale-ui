import {useEffect, useState} from "react";
import { RegisterMachine } from "@/features/machines";
import {Machine} from "@/entities/machine";
import {Page, Card} from "@/shared/ui";

import styles from './machines.module.css'
import { MachineCard } from "@/entities/machine";
import {useRouter} from "next/router";
import {getAuthRedirect} from "@/shared/lib/auth/requireAuth";
import {GetServerSideProps} from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;
  return { props: {} };
};

export const mapMachinesByUserName = (machines: Machine[]) => {
  const grouped = machines.reduce<Record<string, Machine[]>>((acc, machine) => {
    const userName = machine.user?.name ?? 'Default';
    if (!acc[userName]) acc[userName] = [];
    acc[userName].push(machine);
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, machines]) => ({ name, machines }));
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<{name: string, machines: Machine[]}[]>([]);

  async function loadData() {
    try {
      const res = await fetch("/api/internal/machines");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        new Error(data.error || "Failed to load machines");
      }
      const data = await res.json();
      setMachines(mapMachinesByUserName(Array.isArray(data.machines) ? data.machines : []));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data";
      console.error(message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const router = useRouter();

  const goToMachine = (id) => {
    router.push(`/machines/${id}`);
  }

  return (
    <Page title={'Headscale Control'} subtitle={'Manage machines.'}>
      <RegisterMachine onSuccess={loadData}/>

      <div className={styles.namespaces}>
        {!machines.length ? (
          <Card title={'No machines yet.'} subTitle={'Register a node to see machines appear here.'} empty={true} />
        ) : (
          <>
            {machines.map((machine) => {
              return (
                <Card key={machine.name} title={machine.name} collapsable={true}>
                  <div className={styles.machineGrid}>
                    {machine.machines.map((m) => (
                      <div key={m.id} onClick={() => goToMachine(m.id)} style={{maxWidth: '360px'}}>
                        <MachineCard machine={m} />
                      </div>
                    ))}
                  </div>
                </Card>
              ) ;
            })}
          </>
        )}
      </div>
    </Page>
  );
}
