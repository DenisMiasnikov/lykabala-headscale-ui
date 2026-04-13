import type { User, CurrentUser } from "../hooks/types";
import {Button} from "../../../shared/ui/button/Button";
import {formatDate} from "../../../shared/lib/date";

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
          <th>Actions</th>
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
            <td>{user.createdAt ? formatDate(user.createdAt) : "-"}</td>
            <td>
              {user.username === currentUser.username ? (
                <span className="subtitle">(you)</span>
              ) : (
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                  <Button
                    label={user.isAdmin ? "Remove Admin" : "Make Admin"}
                    mode={'action'}
                    onClick={() => onToggleAdmin(user.username, !user.isAdmin)}
                  />

                  <Button
                    label={'Delete'}
                    mode={'danger'}
                    onClick={() => onDeleteUser(user.username)}
                  />
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
