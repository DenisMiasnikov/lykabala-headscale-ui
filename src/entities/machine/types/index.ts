export type Machine = {
  id: string;
  givenName: string;
  ipAddresses?: string[];
  online?: boolean;
  user?: { name?: string };
};
