import {Button, Modal2} from "@/shared";
import React, {useState} from "react";
import UserForm from "@/entities/user/ui/UserForm";
import {useUsers} from "@/features/user/model/hooks/useUsers";

interface UserData {
  username: string;
  isAdmin: boolean;
  createdAt?: string;
}

interface UpdateUserProps {
  user?: UserData;
  currentUser?: UserData;
}

export const UpdateUser: React.FC<UpdateUserProps> = ({user}) => {
  const {
    newUsername,
    setNewUsername,
    newPassword,
    setNewPassword,
    newIsAdmin,
    setNewIsAdmin,
    createUser,
    updateUser,
  } = useUsers();

  const {
    currentUser,
  } = useUsers();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UserData | undefined>(undefined);

  const openCreate = () => {
    setMode('create');
    setSelectedUser(undefined);
    setIsOpen(true);
  };

  const openEdit = (user: UserData) => {
    setMode('edit');
    setSelectedUser(user);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const handleSubmit = () => {
    if (mode === 'create') {
      createUser();
    } else if (user) {
      updateUser(
        user.username,
        newPassword || undefined,
        newIsAdmin !== user.isAdmin ? newIsAdmin : undefined
      );
      setNewPassword("");
    }
  };

  const handleClose = () => {
    setNewUsername("");
    setNewPassword("");
    setNewIsAdmin(false);
    close()
  };

  return (
    <>
      <Button
        label={user? "Edit Profile" : "Create User"}
        mode={user ? 'secondary' : 'default'}
        onClick={openCreate}
      />
      <Modal2
        title={!user ? "Create User" : `Edit User: ${user?.username}`}
        onClose={handleClose}
        isOpen={isOpen}
      >
        <UserForm
          user={user}
          username={!user ? newUsername : user?.username || ""}
          setUsername={!user ? setNewUsername : () => {
          }}
          password={newPassword}
          setPassword={setNewPassword}
          isAdmin={!user ? newIsAdmin : user?.isAdmin || false}
          setIsAdmin={setNewIsAdmin}
          onSubmit={handleSubmit}
          submitLabel={!user ? "Create" : "Update"}
          showAdminToggle={currentUser?.isAdmin}
        />
      </Modal2>
    </>
  );
};
