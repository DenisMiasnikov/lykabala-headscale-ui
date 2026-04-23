"use client";

import { useState, useEffect, useCallback } from "react";
import type { CurrentUser, User } from "../../../../entities/user/types";

export function useUsers() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [editUsername, setEditUsername] = useState("");

  const loadCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/internal/users/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        setEditUsername(data.username);
      } else {
        setError("Failed to load current user");
      }
    } catch (err) {
      setError("Failed to load current user");
    }
  }, []);

  const loadUsers = useCallback(async () => {
    if (!currentUser?.isAdmin) return;
    try {
      const res = await fetch("/api/internal/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }, [currentUser]);

  const updateMyPassword = useCallback(async () => {
    setError("");
    if (!editPassword.trim()) {
      setError("Password cannot be empty");
      return;
    }
    try {
      const res = await fetch("/api/internal/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: editPassword })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update password");
        return;
      }
      setEditPassword("");
      setMessage("Password updated");
    } catch (err) {
      setError("Failed to update password");
    }
  }, [editPassword]);

  const updateMyUsername = useCallback(async () => {
    setError("");
    if (!editUsername.trim()) {
      setError("Username cannot be empty");
      return;
    }
    if (!currentUser) {
      setError("Not authenticated");
      return;
    }
    if (editUsername.trim() === currentUser.username) {
      setError("New username must be different");
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(editUsername.trim())) {
      setError("Username can only contain letters, numbers, underscores, dots, and hyphens");
      return;
    }
    try {
      const res = await fetch("/api/internal/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: editUsername.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update username");
        return;
      }
      setEditUsername("");
      setMessage("Username updated. Please re-login.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError("Failed to update username");
    }
  }, [editUsername, currentUser]);

  const createUser = useCallback(async () => {
    setError("");
    if (!newUsername.trim() || !newPassword.trim()) {
      setError("Username and password required");
      return;
    }
    const username = newUsername.trim();
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      setError("Username can only contain letters, numbers, underscores, dots, and hyphens");
      return;
    }
    try {
      const res = await fetch("/api/internal/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: newPassword,
          isAdmin: newIsAdmin
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to create user");
        return;
      }
      setNewUsername("");
      setNewPassword("");
      setNewIsAdmin(false);
      setMessage("User created");
      loadUsers();
    } catch (err) {
      setError("Failed to create user");
    }
  }, [newUsername, newPassword, newIsAdmin, loadUsers]);

  const toggleAdmin = useCallback(async (userId: string, isAdmin: boolean) => {
    try {
      const res = await fetch(`/api/internal/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin })
      });
      if (res.ok) {
        loadUsers();
      }
    } catch (err) {
      setError("Failed to toggle admin");
    }
  }, [loadUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    const ok = window.confirm(`Delete user?`);
    if (!ok) return;
    try {
      const res = await fetch(`/api/internal/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("User deleted");
        loadUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      setError("Failed to delete user");
    }
  }, [loadUsers]);

  const updateUser = useCallback(async (userId: string, updates: { username?: string; password?: string; isAdmin?: boolean }) => {
    setError("");
    
    if (Object.keys(updates).length === 0) {
      setError("No changes provided");
      return;
    }

    try {
      const res = await fetch(`/api/internal/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update user");
        return;
      }
      setMessage("User updated");
      loadUsers();
    } catch (err) {
      setError("Failed to update user");
    }
  }, [loadUsers]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser, loadUsers]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);



  return {
    currentUser,
    users,
    error,
    message,
    newUsername,
    setNewUsername,
    newPassword,
    setNewPassword,
    newIsAdmin,
    setNewIsAdmin,
    editPassword,
    setEditPassword,
    editUsername,
    setEditUsername,
    updateMyPassword,
    updateMyUsername,
    createUser,
    toggleAdmin,
    deleteUser,
    updateUser,
  };
}
