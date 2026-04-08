export type Namespace = {
  id: string;
  name: string;
  createdAt?: string;
  displayName?: string;
  email?: string;
  profilePicUrl?: string;
};

export type NamespaceDetailsProps = {
  id: string;
};

export type NamespaceDetails = {
  id: string;
  name: string;
  createdAt?: string;
  displayName?: string;
  email?: string;
  providerId?: string;
  provider?: string;
  profilePicUrl?: string;
};
