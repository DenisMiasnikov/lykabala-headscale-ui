import {Card} from "@/shared/ui/card/Card";
import {Input} from "@/shared/ui/input/Input";
import {Toggle} from "@/shared/ui/toggle/Toggle";
import {Button} from "@/shared/ui/button/Button";

interface UserFormProps {
  user?: {
    username: string;
    isAdmin: boolean;
    createdAt?: string;
  };
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  onSubmit: () => void;
  submitLabel: string;
  showAdminToggle?: boolean;
}

export default function UserForm({
  user,
  username,
  setUsername,
  password,
  setPassword,
  isAdmin,
  setIsAdmin,
  onSubmit,
  submitLabel,
  showAdminToggle = false,
}: UserFormProps) {
  const isEditMode = !!user;

  return (
    <Card>
      <div style={{flex: 1, marginBottom: 16}}>
        <label style={{display: "block", marginBottom: 8}}>Username</label>
        <Input
          type={'text'}
          value={username}
          onChange={setUsername}
          placeholder="username"
          disabled={isEditMode}
        />
      </div>

      <div style={{flex: 1, marginBottom: 16}}>
        <label style={{display: "block", marginBottom: 8}}>
          {isEditMode ? "New Password (leave empty to keep current)" : "Password"}
        </label>
        <Input
          type={'password'}
          value={password}
          onChange={setPassword}
          placeholder={isEditMode ? "new password" : "password"}
        />
      </div>

      {showAdminToggle && (
        <Toggle
          value={isAdmin}
          onChange={setIsAdmin}
          label={'Admin'}
        />
      )}

      <Button mode={'secondary'} onClick={onSubmit} label={submitLabel}/>
    </Card>
  );
}
