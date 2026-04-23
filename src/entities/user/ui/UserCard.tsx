import {ReactNode} from "react";
import {Card} from "@/shared/ui";
import {formatDate} from "@/shared/lib/date";
import type {CurrentUser, User} from "../types";


interface UserCardProps {
  user: User;
  currentUser: CurrentUser;
  actions?: ReactNode;
}

export default function UserCard({
                                   user,
                                   currentUser,
                                   actions
                                 }: UserCardProps) {
  const isCurrentUser = user.username === currentUser.username;

  return (
    <Card title={user.username} subTitle={user.isAdmin ? "Admin" : "User"}>
      <div style={{marginBottom: 12, color: 'var(--text-secondary)', fontSize: 14}}>
        Created: {user.createdAt ? formatDate(user.createdAt) : "-"}
      </div>

      {isCurrentUser && (
        <div style={{marginBottom: 12}}>
          <span className="subtitle">(you)</span>
        </div>
      )}

      <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
        {(isCurrentUser || currentUser?.isAdmin) && (
          actions
        )}
      </div>
    </Card>
  );
}
