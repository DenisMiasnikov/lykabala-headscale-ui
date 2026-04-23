export type User = {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
};

export type CurrentUser = User & {
  passwordHash?: string;
  salt?: string;
};
