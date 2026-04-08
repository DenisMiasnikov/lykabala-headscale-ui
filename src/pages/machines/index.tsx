import {useEffect, useState} from "react";
import { RegisterMachine } from "../../features/machines";
import {Machine} from "../../entities/machine/types";
import {Page} from "../../shared/ui/page/Page";

import styles from './machines.module.css'
import {Card} from "../../shared/ui/card/Card";
import MachineCard from "../../entities/machine/ui/machine-card/MachineCard";
import {useRouter} from "next/router";

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const redirect = await getAuthRedirect(context);
//   if (redirect) return redirect;
//   return { props: {} };
// };

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
      const res = await fetch("/api/machines");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load machines");
      }
      const data = await res.json();
      setMachines(mapMachinesByUserName(Array.isArray(data.machines) ? data.machines : []));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data";
      console.error(message);
    }
  }

  // useEffect(() => {
  //   loadData();
  // }, []);



  useEffect(() => {
    const data = {
      "machines": [
        {
          "id": "1",
          "machineKey": "mkey:f2d81cd982cfe6ad3e68134dda69285c16fcf2e7321d1f4bd7d95e3bdd796c28",
          "nodeKey": "nodekey:36f83885dee31c0035aefe22c6a4a6991c336e99c5a824f74ab19fed63e89c45",
          "discoKey": "discokey:3b7c214b5c45c20549a386bd6855c6f5a9d1d87bea3288792b8b0a5b54efae18",
          "ipAddresses": [
            "100.64.0.1",
            "fd7a:115c:a1e0::1"
          ],
          "name": "invalid-xtismnjt",
          "user": {
            "id": "1",
            "name": "Denis",
            "createdAt": "2025-08-25T12:38:31.056411366Z",
            "displayName": "",
            "email": "",
            "providerId": "",
            "provider": "",
            "profilePicUrl": ""
          },
          "lastSeen": "2026-04-08T09:44:46.565033632Z",
          "expiry": "0001-01-01T00:00:00Z",
          "preAuthKey": null,
          "createdAt": "2025-08-25T12:49:15.146373278Z",
          "registerMethod": "REGISTER_METHOD_CLI",
          "givenName": "macbook",
          "online": true,
          "approvedRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "availableRoutes": [],
          "subnetRoutes": [],
          "tags": []
        },
        {
          "id": "7",
          "machineKey": "mkey:56d36e8e39b2896e983aee640b1dd722c0500bf923ede9ed673c4078e7ca3d0d",
          "nodeKey": "nodekey:e8400d2da386da55b5d95570a42d28f67a159a9846b5c589ecd15a4e33a14808",
          "discoKey": "discokey:8ac5997dcbf43c95266e3f78f8fea44dd5e2f93d1eab838aecbda3d411e72979",
          "ipAddresses": [
            "100.64.0.12",
            "fd7a:115c:a1e0::c"
          ],
          "name": "131987",
          "user": {
            "id": "3",
            "name": "EESTI",
            "createdAt": "2025-08-26T19:34:49.847776331Z",
            "displayName": "",
            "email": "",
            "providerId": "",
            "provider": "",
            "profilePicUrl": ""
          },
          "lastSeen": "2026-03-31T06:44:18.007546827Z",
          "expiry": "0001-01-01T00:00:00Z",
          "preAuthKey": null,
          "createdAt": "2025-11-20T13:21:28.170379825Z",
          "registerMethod": "REGISTER_METHOD_AUTH_KEY",
          "givenName": "vpn-germany",
          "online": true,
          "approvedRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "availableRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "subnetRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "tags": []
        },
        {
          "id": "8",
          "machineKey": "mkey:5a31ebb823e4dd117a78400c025defa3fca97ece0d1af90eb872e2f348ce7e64",
          "nodeKey": "nodekey:b300b1912bda775eb16842337a8ba593cb3c1bf2c34e177fab909e4cbf8abb35",
          "discoKey": "discokey:3f17ea4ae4ddccd33ecc4c7b9defecab478638318c8c4ee5a8e3041c3f2bd774",
          "ipAddresses": [
            "100.64.0.3",
            "fd7a:115c:a1e0::3"
          ],
          "name": "localhost",
          "user": {
            "id": "1",
            "name": "Denis",
            "createdAt": "2025-08-25T12:38:31.056411366Z",
            "displayName": "",
            "email": "",
            "providerId": "",
            "provider": "",
            "profilePicUrl": ""
          },
          "lastSeen": "2026-04-04T08:55:45.068520512Z",
          "expiry": "0001-01-01T00:00:00Z",
          "preAuthKey": null,
          "createdAt": "2026-03-08T16:00:36.746727055Z",
          "registerMethod": "REGISTER_METHOD_CLI",
          "givenName": "iphone",
          "online": false,
          "approvedRoutes": [],
          "availableRoutes": [],
          "subnetRoutes": [],
          "tags": []
        },
        {
          "id": "10",
          "machineKey": "mkey:a67f5664b99ec67ec464676d5f05dc141b71f1f02ad7bbf9b5009b8052a27025",
          "nodeKey": "nodekey:d9a4cd2bb91bc1ad170bc6b7909f9d75de53dd85073079f4382e64b5aefdaf04",
          "discoKey": "discokey:3e81d72ea520c6f3ec97b00a6d2148d972829d19840c7d414631297d68634806",
          "ipAddresses": [
            "100.64.0.5",
            "fd7a:115c:a1e0::5"
          ],
          "name": "localhost",
          "user": {
            "id": "5",
            "name": "Seyla",
            "createdAt": "2026-03-08T16:05:43.023844152Z",
            "displayName": "",
            "email": "",
            "providerId": "",
            "provider": "",
            "profilePicUrl": ""
          },
          "lastSeen": "2026-04-08T09:42:45.358766189Z",
          "expiry": "0001-01-01T00:00:00Z",
          "preAuthKey": null,
          "createdAt": "2026-03-08T16:09:26.997594342Z",
          "registerMethod": "REGISTER_METHOD_CLI",
          "givenName": "iphone-seyla",
          "online": true,
          "approvedRoutes": [],
          "availableRoutes": [],
          "subnetRoutes": [],
          "tags": []
        },
        {
          "id": "11",
          "machineKey": "mkey:f6a85b710ccbcc25acf7f9f7271f1be59753f7180daa376f348fb8bcffafc726",
          "nodeKey": "nodekey:ad2a05e6860f2a636fac478b5b930af3c3dc6582fadb9e914293f0345af3c41f",
          "discoKey": "discokey:c4ed28b7d9443efd3684633823017d03056a3fe70bea66c335bca406f3762828",
          "ipAddresses": [
            "100.64.0.6",
            "fd7a:115c:a1e0::6"
          ],
          "name": "vdska",
          "user": {
            "id": "6",
            "name": "VDSKA",
            "createdAt": "2026-03-09T08:00:23.862588454Z",
            "displayName": "",
            "email": "",
            "providerId": "",
            "provider": "",
            "profilePicUrl": ""
          },
          "lastSeen": "2026-04-06T21:53:57.091275412Z",
          "expiry": "0001-01-01T00:00:00Z",
          "preAuthKey": null,
          "createdAt": "2026-03-09T08:29:38.486740116Z",
          "registerMethod": "REGISTER_METHOD_AUTH_KEY",
          "givenName": "vpn-suomi",
          "online": true,
          "approvedRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "availableRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "subnetRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "tags": []
        },
        {
          "id": "12",
          "machineKey": "mkey:9391973fc2dbcf4838ac3690a86733b95002dc1ea47eb71d6d8c95a13d7f9b0e",
          "nodeKey": "nodekey:e9a2a93a94c6585c3b498764385496d0cc8742b6a8ab288a96ca9fa55e04694d",
          "discoKey": "discokey:475179d6523dde8b13eef9c3a4cec4e8fd499afa6ee19ce3f0b8c15c40ef9608",
          "ipAddresses": [
            "100.64.0.7",
            "fd7a:115c:a1e0::7"
          ],
          "name": "localhost",
          "user": {
            "id": "1",
            "name": "Denis",
            "createdAt": "2025-08-25T12:38:31.056411366Z",
            "displayName": "",
            "email": "",
            "providerId": "",
            "provider": "",
            "profilePicUrl": ""
          },
          "lastSeen": "2026-03-22T07:38:38.150975719Z",
          "expiry": null,
          "preAuthKey": null,
          "createdAt": "2026-03-09T11:40:59.910044427Z",
          "registerMethod": "REGISTER_METHOD_CLI",
          "givenName": "ipad",
          "online": false,
          "approvedRoutes": [],
          "availableRoutes": [],
          "subnetRoutes": [],
          "tags": []
        },
        {
          "id": "13",
          "machineKey": "mkey:d0ab47c4dd8337305f45053f4d08abeadd0645a041fadcf6281152e493243838",
          "nodeKey": "nodekey:9e971c0a80e4d70e5d5ff9e58deaec1527a4ab3efc300dd98eb75a404b5a9b74",
          "discoKey": "discokey:fb50b2372f2f7c4a88b22c3145e8978c9603c4cee09b53305a7029318675cc2e",
          "ipAddresses": [
            "100.64.0.8",
            "fd7a:115c:a1e0::8"
          ],
          "name": "homelab",
          "user": {
            "id": "8",
            "name": "HOMELAB",
            "createdAt": "2026-03-09T12:32:06.009023681Z",
            "displayName": "",
            "email": "",
            "providerId": "",
            "provider": "",
            "profilePicUrl": ""
          },
          "lastSeen": "2026-04-08T08:48:03.501844279Z",
          "expiry": "0001-01-01T00:00:00Z",
          "preAuthKey": null,
          "createdAt": "2026-03-09T12:33:22.474175025Z",
          "registerMethod": "REGISTER_METHOD_AUTH_KEY",
          "givenName": "vpn-sbp-homelab",
          "online": false,
          "approvedRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "availableRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "subnetRoutes": [
            "0.0.0.0/0",
            "::/0"
          ],
          "tags": []
        },
        {
          "id": "14",
          "machineKey": "mkey:3cdf7d2f082fed1ef583812ffc1e691b6fd8bf04ee7a4aab1f463317b4917729",
          "nodeKey": "nodekey:f1b8041c0ef5148eb02f05faa584bbd7d891dd5da4b31ca18d638167a062b70f",
          "discoKey": "discokey:15ecbfcab841295d70cae0dbdb76e56a0e47cefa93e0741c5e5aca21183a0679",
          "ipAddresses": [
            "100.64.0.2",
            "fd7a:115c:a1e0::2"
          ],
          "name": "localhost",
          "user": {
            "id": "1",
            "name": "Denis",
            "createdAt": "2025-08-25T12:38:31.056411366Z",
            "displayName": "",
            "email": "",
            "providerId": "",
            "provider": "",
            "profilePicUrl": ""
          },
          "lastSeen": "2026-04-05T16:15:45.746006350Z",
          "expiry": "0001-01-01T00:00:00Z",
          "preAuthKey": null,
          "createdAt": "2026-03-20T17:52:14.983094119Z",
          "registerMethod": "REGISTER_METHOD_CLI",
          "givenName": "samsung-tofik",
          "online": false,
          "approvedRoutes": [],
          "availableRoutes": [],
          "subnetRoutes": [],
          "tags": []
        },
        {
          "id": "15",
          "machineKey": "mkey:872ceb6a6ea9b270a7c73acc4c31f5ec6e6e07381af958b77ddc72958088426b",
          "nodeKey": "nodekey:124b24cc42434789fba23531d6a1e64f887b3eb07b928bc69f858adabbc4620d",
          "discoKey": "discokey:d6c757f249d6e96c7a52065712ff42e8922874f89c1dfa5f753e3c219d622e39",
          "ipAddresses": [
            "100.64.0.4",
            "fd7a:115c:a1e0::4"
          ],
          "name": "iphone",
          "user": {
            "id": "14",
            "name": "Galina",
            "createdAt": "2026-03-31T17:46:05.978293519Z",
            "displayName": "",
            "email": "",
            "providerId": "",
            "provider": "",
            "profilePicUrl": ""
          },
          "lastSeen": "2026-04-05T11:23:17.729292780Z",
          "expiry": "0001-01-01T00:00:00Z",
          "preAuthKey": null,
          "createdAt": "2026-03-31T17:48:19.523957389Z",
          "registerMethod": "REGISTER_METHOD_CLI",
          "givenName": "iphone-galina",
          "online": false,
          "approvedRoutes": [],
          "availableRoutes": [],
          "subnetRoutes": [],
          "tags": []
        }
      ]
    }
    setMachines(mapMachinesByUserName(Array.isArray(data.machines) ? data.machines : []));
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
          <div className={styles.emptyState}>
            <h3>No machines yet.</h3>
            <p>Register a node to see machines appear here.</p>
          </div>
        ) : (
          <>
            {machines.map((machine) => {
              return (
                <Card key={machine.name} title={machine.name} collapsable={true}>
                  <div className={styles.machineGrid}>
                    {machine.machines.map((m) => (
                      <div key={m.id} onClick={() => goToMachine(m.id)}>
                        <MachineCard details={m}/>
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
