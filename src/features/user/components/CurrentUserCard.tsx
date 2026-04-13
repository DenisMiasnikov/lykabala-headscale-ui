import type { CurrentUser } from "../hooks/types";
import {Card} from "../../../shared/ui/card/Card";
import {Input} from "../../../shared/ui/input/Input";
import {Button} from "../../../shared/ui/button/Button";

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
    <Card title={currentUser.username} subTitle={currentUser.isAdmin ? "Admin" : "User"}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: 8 }}>Change Username</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              type={'text'}
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              placeholder="Enter new username"
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: 8 }}>Change Password</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
        </div>

      <Button
        label={'Update Username'}
        type={'button'}
        onClick={onUpdateUsername}
        mode={'secondary'}/>

      <Button
        label={'Update Password'}
        type={'button'}
        onClick={onUpdatePassword}
        mode={'secondary'}/>
    </Card>
  );
}
