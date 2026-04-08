import type {NamespaceDetails} from "../../namespace/types";

export type Machine = {
  id: string;
  givenName: string;
  ipAddresses?: string[];
  online?: boolean;
  user?: NamespaceDetails;
};

export type MachineDetailsProps = {
  id: string;
};

export type MachineDetails = {
  id?: string;
  machineKey?: string;
  nodeKey?: string;
  discoKey?: string;
  givenName?: string;
  availableRoutes?: string[];
  approvedRoutes?: string[];
  user?: NamespaceDetails;
  tags?: string[];
  online?: boolean;
  ipAddresses?: string[];
  lastSeen?: string;
  createdAt?: string;
  name?: string;
  expiry?: string;
  preAuthKey?: string;
  registerMethod?: string;
  subnetRoutes?: string[];
};
