interface CreateUserFormProps {
  newUsername: string;
  setNewUsername: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  newIsAdmin: boolean;
  setNewIsAdmin: (value: boolean) => void;
  onCreateUser: () => void;
}

export default function CreateUserForm({
  newUsername,
  setNewUsername,
  newPassword,
  setNewPassword,
  newIsAdmin,
  setNewIsAdmin,
  onCreateUser
}: CreateUserFormProps) {
  return (
    <div style={{ marginBottom: 24, padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12 }}>
      <h3 style={{ marginTop: 0 }}>Create New User</h3>
      <div className="row" style={{ alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label>Username</label>
          <input
            className="input"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="username"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="password"
          />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <label style={{ display: "flex", alignItems: "center" }}>
            Admin
          </label>
          <input
            type="checkbox"
            checked={newIsAdmin}
            onChange={(e) => setNewIsAdmin(e.target.checked)}
          />
        </div>
        <div style={{ alignSelf: "flex-end" }}>
          <button className="button secondary" onClick={onCreateUser}>Create</button>
        </div>
      </div>
    </div>
  );
}
