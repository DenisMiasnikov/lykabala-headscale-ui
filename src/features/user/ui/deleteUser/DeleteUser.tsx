import {Button, Modal} from "@/shared";
import React, {useState} from "react";
import {useDeleteClient} from "@/entities/user/model";

interface UserData {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt?: string;
}

interface UpdateUserProps {
  user?: UserData;
}

export const DeleteUser: React.FC<UpdateUserProps> = ({user}) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const {mutate} = useDeleteClient()

  return (
    <>
      <Button
        mode={'danger'}
        label={'Delete user'}
        onClick={open}
      />
      <Modal
        title={`Delete user ${user?.username}`}
        onClose={close}
        isOpen={isOpen}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center'}}>
          <div>{`Are you sure to delete user ${user?.username} ?`}</div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center', height: '10px'}}>
            <Button mode={'danger'} label={'Delete'} onClick={() => {
              mutate({id: user?.id})
              close()
            }}/>
            <Button mode={'secondary'} label={'Cancel'} onClick={close}/>
          </div>
        </div>
      </Modal>
    </>
  );
};
