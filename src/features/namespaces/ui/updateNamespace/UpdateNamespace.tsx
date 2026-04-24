import {useState} from "react";
import NamespaceForm from "@/entities/namespace/ui/namespace-from/NamespaceForm";
import {Namespace} from "@/entities";
import {Modal, Button} from "@/shared";
import {useCreateNamespace, useUpdateNamespace} from "@/entities/namespace/model/mutations";

interface IUpdateNamespaceProps {
  namespace?: Namespace;
}

export const UpdateNamespace = (
  {
    namespace,
  }: IUpdateNamespaceProps,
) => {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false)
  const open = () => setIsOpen(true)

  const {mutate} = useCreateNamespace()
  const {mutate: update} = useUpdateNamespace()

  return (
    <>
      <Button
        label={namespace?.id ? 'Update Namespace' : 'Create Namespace'}
        type={'button'}
        onClick={open}
        mode={'action'}
      />
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={namespace?.id ? 'Update Namespace' : 'Create Namespace'}
      >
        <NamespaceForm
          namespace={namespace}
          onSubmit={
            async ({ value }) => {
              namespace?.id ? update({id: namespace?.id, payload: value}) : mutate(value)
              close();
            }
          }
        />
      </Modal>
    </>
  );
};

export default UpdateNamespace;
