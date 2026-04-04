export type AuthKey = {
  id: string;
  key: string;
  reusable: boolean;
  ephemeral: boolean;
  used: boolean;
  createdAt: string;
  expiration?: string;
  aclTags?: string[];
  user: { name: string };
};
