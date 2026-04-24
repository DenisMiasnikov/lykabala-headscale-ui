import {Button, Modal} from "@/shared";
import React, {useState} from "react";
import UserForm from "@/entities/user/ui/UserForm";
import {useCreateClient, useUpdateClient} from "@/entities/user/model";

interface UserData {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt?: string;
}

interface UpdateUserProps {
  user?: UserData;
}

export const UpdateUser: React.FC<UpdateUserProps> = ({user}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | undefined>(undefined);

  const openCreate = () => {
    setSelectedUser(undefined);
    setIsOpen(true);
  };

  const openEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const {mutate} = useCreateClient()
  const {mutate: update} = useUpdateClient()

  return (
    <>
      <Button
        label={user? "Edit Profile" : "Create User"}
        mode={user ? 'secondary' : 'default'}
        onClick={user ? () => openEdit(user) : openCreate}
      />
      <Modal
        title={!selectedUser ? "Create User" : `Edit User: ${selectedUser.username}`}
        onClose={close}
        isOpen={isOpen}
      >
        <UserForm
          onSubmit={async ({ value }) => {
            user?.id ? update({id:user?.id, payload: value}) :mutate(value)
            close();
          }}
          user={selectedUser}
        />
      </Modal>
    </>
  );
};
