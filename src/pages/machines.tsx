import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../shared/lib/auth/requireAuth";
import Table, { ITableColumn } from "../shared/ui/table/Table";
import { ChevronRightIcon, ChevronDownIcon } from "../shared/ui/icons/Icons";
import { RegisterNodeKeyForm } from "../features/machines/ui/RegisterNodeKeyForm/RegisterNodeKeyForm";
import { DeleteMachineButton } from "../features/machines/ui/DeleteMachineButton/DeleteMachineButton";

type Machine = {
  id: string;
  givenName: string;
  ipAddresses?: string[];
  online?: boolean;
  user?: { name?: string };
};

type Namespace = {
  id?: string;
  name: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;
  return { props: {} };
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  async function loadData() {
    try {
      const res = await fetch("/api/machines");
      const data = await res.json();
      if (!res.ok) {
        new Error(data.error || "Failed to load machines");
      }
      setMachines(Array.isArray(data.machines) ? data.machines : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data";
      console.error(message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Define columns
  const columns: ITableColumn<Machine>[] = [
    {
      key: "givenName",
      label: "Hostname",
      render: (value, row) => (
        <a href={`/machines/${row.id}`}>{value as string}</a>
      ),
    },
    {
      key: "ipAddresses",
      label: "IP",
      render: (value) => (value as string[] | undefined)?.[0] || "",
    },
    {
      key: "online",
      label: "Status",
      render: (value) => (
        <span className={`pill ${value ? "online" : "offline"}`}>
          {value ? "Online" : "Offline"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_value, row) => (
        <DeleteMachineButton
          machineId={row.id}
          onSuccess={() => {
            // The parent component will refresh data via useEffect
          }}
        />
      ),
    },
  ];

  // Custom group header renderer
  const renderGroupHeader = (
    userName: string,
    userMachines: Machine[],
    isExpanded: boolean,
    toggle: () => void
  ) => {
    const onlineCount = userMachines.filter((m) => m.online).length;
    const totalCount = userMachines.length;

    return (
      <div className="user-group-header" onClick={toggle}>
        <div className="user-group-info">
          <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </span>
          <span className="user-name">{userName}</span>
          <span className="machine-count">
            <span className="online-dot">{onlineCount}</span>
            <span className="total-count">/{totalCount}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Headscale Control</h1>
        <p className="subtitle">Manage machines.</p>

        <RegisterNodeKeyForm
          namespaces={namespaces}
          onSuccess={() => loadData()}
        />

         <div className="card">
           <h2 className="title" style={{ fontSize: 22 }}>
             Machines
           </h2>
           {machines.length === 0 ? (
             <div className="subtitle">No machines yet.</div>
           ) : (
             <Table
               columns={columns}
               data={machines}
               rowKey="id"
               groupBy={(machine) => machine.user?.name || "Unassigned"}
               expandedGroups={expandedUsers}
               onExpandedGroupsChange={(groups) => setExpandedUsers(groups)}
               renderGroupHeader={renderGroupHeader}
               rowClassName="machine-row"
             />
           )}
         </div>
      </div>
    </div>
  );
}
