import type { CurrentUser } from "../hooks/types";

interface CurrentUserCardProps {
  currentUser: CurrentUser;
  editPassword: string;
  setEditPassword: (value: string) => void;
  onUpdatePassword: () => void;
  editUsername: string;
  setEditUsername: (value: string) => void;
  onUpdateUsername: () => void;
}

export default function CurrentUserCard({
  currentUser,
  editPassword,
  setEditPassword,
  onUpdatePassword,
  editUsername,
  setEditUsername,
  onUpdateUsername
}: CurrentUserCardProps) {
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="title" style={{ fontSize: 22 }}>{currentUser.username}</h2>
        <span className="pill online">{currentUser.isAdmin ? "Admin" : "User"}</span>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>Change Username</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              placeholder="Enter new username"
              style={{ flex: 1 }}
            />
            <button className="button secondary" onClick={onUpdateUsername}>Update Username</button>
          </div>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 8 }}>Change Password</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Enter new password"
              style={{ flex: 1 }}
            />
            <button className="button" onClick={onUpdatePassword}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}
