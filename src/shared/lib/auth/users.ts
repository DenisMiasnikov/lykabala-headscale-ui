import fs from "fs";
import path from "path";
import crypto from "crypto";

const USERS_FILE = process.env.USERS_FILE || path.join(process.cwd(), "users.json");

const USERS_DIR = path.dirname(USERS_FILE);
if (!fs.existsSync(USERS_DIR)) {
  fs.mkdirSync(USERS_DIR, { recursive: true });
}

function generateId(): string {
  return crypto.randomUUID();
}

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  salt?: string;
  isAdmin: boolean;
  createdAt: string;
};

type UsersData = {
  users: User[];
};

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export { hashPassword };

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function readUsers(): UsersData {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read users file:", err);
  }
  return { users: [] };
}

function writeUsers(data: UsersData): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

export function getUser(username: string): User | null {
  const data = readUsers();
  return data.users.find((u) => u.username === username) || null;
}

export function getUserWithId(username: string): (Omit<User, 'passwordHash' | 'salt'> & { passwordHash: string; salt: string }) | null {
  const data = readUsers();
  const user = data.users.find((u) => u.username === username);
  if (!user) return null;
  return { ...user, passwordHash: "********", salt: "********" };
}

export function getUserById(id: string): (Omit<User, 'passwordHash' | 'salt'> & { passwordHash: string; salt: string }) | null {
  const data = readUsers();
  const user = data.users.find((u) => u.id === id);
  if (!user) return null;
  return { ...user, passwordHash: "********", salt: "********" };
}

export function deleteUserById(id: string): boolean {
  const data = readUsers();
  const index = data.users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  data.users.splice(index, 1);
  writeUsers(data);
  return true;
}

export function getAllUsers(): (Omit<User, 'passwordHash' | 'salt'> & { passwordHash: string; salt: string })[] {
  const data = readUsers();
  return data.users.map((u) => ({ ...u, passwordHash: "********", salt: "********" }));
}

export function validatePassword(username: string, password: string): boolean {
  const user = getUser(username);
  console.log("Validating user:", username, "found:", !!user);
  if (!user) return false;
  const salt = user.salt || username.slice(0, 16);
  const hash = hashPassword(password, salt);
  console.log("Password match:", hash === user.passwordHash);
  return hash === user.passwordHash;
}

export function createUser(username: string, password: string, isAdmin: boolean = false): boolean {
  try {
    const data = readUsers();
    if (data.users.find((u) => u.username === username)) {
      return false;
    }
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    data.users.push({
      id: generateId(),
      username,
      passwordHash,
      salt,
      isAdmin,
      createdAt: new Date().toISOString()
    });
    writeUsers(data);
    console.log("User created:", username, "isAdmin:", isAdmin);
    return true;
  } catch (err) {
    console.error("Failed to create user:", err);
    return false;
  }
}

export function createUserWithPasswordHash(
  username: string,
  passwordHash: string,
  isAdmin: boolean = false
): boolean {
  try {
    const data = readUsers();
    if (data.users.find((u) => u.username === username)) {
      return false;
    }
    const salt = crypto.randomBytes(16).toString("hex");
    data.users.push({
      id: generateId(),
      username,
      passwordHash,
      salt,
      isAdmin,
      createdAt: new Date().toISOString()
    });
    writeUsers(data);
    console.log("User created:", username, "isAdmin:", isAdmin);
    return true;
  } catch (err) {
    console.error("Failed to create user:", err);
    return false;
  }
}

export function updateUser(
  username: string,
  updates: { password?: string; isAdmin?: boolean; username?: string; passwordHash?: string }
): boolean {
  const data = readUsers();
  const index = data.users.findIndex((u) => u.username === username);
  if (index === -1) return false;
  const user = data.users[index];

  // Migrate: ensure user has a salt
  if (!user.salt) {
    data.users[index].salt = username.slice(0, 16);
  }

  if (updates.password) {
    const salt = data.users[index].salt!;
    data.users[index].passwordHash = hashPassword(updates.password, salt);
  }

  if (updates.passwordHash) {
    data.users[index].passwordHash = updates.passwordHash;
  }

  if (updates.isAdmin !== undefined) {
    data.users[index].isAdmin = updates.isAdmin;
  }

  if (updates.username) {
    const existingUser = data.users.find((u) => u.username === updates.username);
    if (existingUser && existingUser.username !== user.username) {
      return false;
    }
    data.users[index].username = updates.username;
  }

  writeUsers(data);
  return true;
}

export function deleteUser(username: string): boolean {
  const data = readUsers();
  const index = data.users.findIndex((u) => u.username === username);
  if (index === -1) return false;
  data.users.splice(index, 1);
  writeUsers(data);
  return true;
}

export function initDefaultUser(): void {
  try {
    const data = readUsers();
    if (data.users.length === 0) {
      const defaultAdmin = process.env.UI_USERNAME || "admin";
      const defaultPass = process.env.UI_PASSWORD || "admin";
      createUser(defaultAdmin, defaultPass, true);
    }
  } catch (err) {
    console.error("Failed to init default user:", err);
  }
}

initDefaultUser();
