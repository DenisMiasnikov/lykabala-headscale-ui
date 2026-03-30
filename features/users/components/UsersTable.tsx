import type { User, CurrentUser } from "../hooks/types";

interface UsersTableProps {
  users: User[];
  currentUser: CurrentUser;
  onToggleAdmin: (username: string, isAdmin: boolean) => void;
  onDeleteUser: (username: string) => void;
}

export default function UsersTable({
  users,
  currentUser,
  onToggleAdmin,
  onDeleteUser
}: UsersTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Role</th>
          <th>Created</th>
          <th style={{ textAlign: "right" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.username}>
            <td>{user.username}</td>
            <td>
              <span className={`pill ${user.isAdmin ? "online" : ""}`}>
                {user.isAdmin ? "Admin" : "User"}
              </span>
            </td>
            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
            <td style={{ textAlign: "right" }}>
              {user.username === currentUser.username ? (
                <span className="subtitle">(you)</span>
              ) : (
                <>
                  <button
                    className="button secondary"
                    onClick={() => onToggleAdmin(user.username, !user.isAdmin)}
                    style={{ marginRight: 8 }}
                  >
                    {user.isAdmin ? "Remove Admin" : "Make Admin"}
                  </button>
                  <button
                    className="button"
                    onClick={() => onDeleteUser(user.username)}
                    style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
                  >
                    Delete
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
