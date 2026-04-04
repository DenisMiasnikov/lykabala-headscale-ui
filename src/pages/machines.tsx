import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getAuthRedirect } from "../shared/lib/auth/requireAuth";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  TrashIcon,
  XIcon,
} from "../shared/ui/icons/Icons";
import Table, { ITableColumn } from "../shared/ui/table/Table";

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
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [registerUser, setRegisterUser] = useState("");
  const [nodeKey, setNodeKey] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerResult, setRegisterResult] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [deleteConfirmations, setDeleteConfirmations] = useState<
    Record<string, boolean>
  >({});

  // Auto-fill node key from URL query parameter
  useEffect(() => {
    if (router.query.key && typeof router.query.key === "string") {
      setNodeKey(router.query.key);
    }
  }, [router.query]);

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

  async function loadNamespaces() {
    try {
      const res = await fetch("/api/namespaces");
      const data = await res.json();
      if (!res.ok) {
        new Error(data.error || "Failed to load namespaces");
      }
      const list = Array.isArray(data.namespaces) ? data.namespaces : [];
      setNamespaces(list);
      if (!registerUser && list.length > 0) {
        setRegisterUser(list[0].name);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data";
      console.error(message);
    }
  }

  useEffect(() => {
    loadData();
    loadNamespaces();
  }, []);

  function showDeleteConfirmation(machineId: string) {
    setDeleteConfirmations((prev) => ({ ...prev, [machineId]: true }));
  }

  function cancelDeleteConfirmation(machineId: string) {
    setDeleteConfirmations((prev) => {
      const next = { ...prev };
      delete next[machineId];
      return next;
    });
  }

  async function confirmDeleteMachine(id: string) {
    await fetch(`/api/machines/${id}`, { method: "DELETE" });
    setDeleteConfirmations((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await loadData();
  }

  async function registerNode() {
    setRegisterError("");
    setRegisterResult("");
    const trimmedKey = nodeKey.trim();
    if (!registerUser || !trimmedKey) {
      setRegisterError("Provide a user and node key");
      return;
    }

    const res = await fetch("/api/nodes/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: registerUser, key: trimmedKey }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setRegisterError(data.error || "Failed to register node");
      return;
    }

    const label = data.givenName || data.name || data.id || "node";
    setRegisterResult(`Registered ${label}`);
    setNodeKey("");
    await loadData();
  }

  // Group machines by user
  const groupedMachines: Record<string, Machine[]> = machines.reduce(
    (acc, machine) => {
      const userName = machine.user?.name || "Unassigned";
      if (!acc[userName]) {
        acc[userName] = [];
      }
      acc[userName].push(machine);
      return acc;
    },
    {} as Record<string, Machine[]>,
  );

  // Sort groups alphabetically
  const sortedUserNames = Object.keys(groupedMachines).sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  });

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
      render: (_value, row) => {
        const machineId = row.id;
        const isDeleting = deleteConfirmations[machineId];
        return (
          <div className="action-buttons-group">
            {isDeleting ? (
              <>
                <button
                  className="button action-button delete-button"
                  onClick={() => confirmDeleteMachine(machineId)}
                  title="Confirm delete"
                >
                  <TrashIcon />
                </button>
                <button
                  className="button secondary action-button"
                  onClick={() => cancelDeleteConfirmation(machineId)}
                  title="Cancel"
                >
                  <XIcon />
                </button>
              </>
            ) : (
              <button
                className="button secondary action-button"
                onClick={() => showDeleteConfirmation(machineId)}
                title="Delete"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        );
      },
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

        <div className="card" style={{ marginBottom: 24 }}>
          <h2 className="title" style={{ fontSize: 22 }}>
            Register Node Key
          </h2>
          <div className="row" style={{ alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label>User</label>
              <select
                className="input"
                value={registerUser}
                onChange={(event) => setRegisterUser(event.target.value)}
              >
                <option value="">Select a user</option>
                {namespaces.map((ns) => (
                  <option key={ns.id || ns.name} value={ns.name}>
                    {ns.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 2, minWidth: 260 }}>
              <label>Node Key</label>
              <input
                className="input"
                value={nodeKey}
                onChange={(event) => setNodeKey(event.target.value)}
                placeholder="Paste node key from Tailscale app"
              />
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button className="button" onClick={registerNode}>
                Register
              </button>
            </div>
          </div>
          {registerError ? <div className="error">{registerError}</div> : null}
          {registerResult ? (
            <div className="pill online" style={{ marginTop: 12 }}>
              {registerResult}
            </div>
          ) : null}
        </div>

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
