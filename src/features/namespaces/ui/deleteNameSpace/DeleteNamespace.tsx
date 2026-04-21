import {Button} from "@/shared";

export const DeleteNamespace = ({
                                  namespace,
                                  onError,
                                  onSuccess
                                }) => {
  async function deleteNamespace(id: string, name: string) {
    const ok = window.confirm(`Delete namespace "${name}"? This cannot be undone.`);
    if (!ok) return;

    const res = await fetch(`/api/internal/namespaces/${id}`, {
      method: "DELETE"
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      onError(data.error || "Failed to delete namespace");
      return;
    }

    onSuccess('Namespace deleted')
  }

  return (
    <Button
      label={'Delete'}
      mode={'danger'}
      type={'button'}
      onClick={() => deleteNamespace(namespace.id, namespace.name)}
    />
  )
}
