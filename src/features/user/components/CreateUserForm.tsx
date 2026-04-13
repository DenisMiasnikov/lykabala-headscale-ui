import {Card} from "../../../shared/ui/card/Card";
import {Input} from "../../../shared/ui/input/Input";
import {Toggle} from "../../../shared/ui/toggle/Toggle";
import {Button} from "../../../shared/ui/button/Button";

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
    <Card title="Create New User">
      <div style={{flex: 1}}>
        <label style={{display: "block", marginBottom: 8}}>Username</label>
        <Input
          type={'text'}
          value={newUsername}
          onChange={setNewUsername}
          placeholder="username"
        />
      </div>
      <div style={{flex: 1}}>
        <label style={{display: "block", marginBottom: 8}}>Password</label>
        <Input
          type={'password'}
          value={newPassword}
          onChange={setNewPassword}
          placeholder="password"
        />
      </div>

      <Toggle
        value={newIsAdmin}
        onChange={setNewIsAdmin}
        label={'Admin'}
      />

      <Button mode={'secondary'} onClick={onCreateUser} label={'Create'}/>
    </Card>
  );
}
