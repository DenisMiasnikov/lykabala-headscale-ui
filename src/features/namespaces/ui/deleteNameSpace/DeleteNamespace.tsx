import {useDeleteNamespace} from "@/entities/namespace/model/mutations";
import {Button, Modal} from "@/shared";
import React, {useState} from "react";
import {Namespace} from "@/entities";

interface IDeleteNamespaceProps {
  namespace: Namespace;
}

export const DeleteNamespace = (
  {
    namespace
  }: IDeleteNamespaceProps
) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const {mutate} = useDeleteNamespace()
  return (
    <>
      <Button
        label={'Delete'}
        mode={'danger'}
        type={'button'}
        onClick={open}
      />
      <Modal
        title={`Delete namespace ${namespace?.name}`}
        onClose={close}
        isOpen={isOpen}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center'}}>
          <div>{`Are you sure to delete namespace ${namespace?.name} ?`}</div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center', height: '10px'}}>
            <Button mode={'danger'} label={'Delete'} onClick={() => {
              mutate({id: namespace.id})
              close()
            }}/>
            <Button mode={'secondary'} label={'Cancel'} onClick={close}/>
          </div>
        </div>
      </Modal>
    </>
  )
}
