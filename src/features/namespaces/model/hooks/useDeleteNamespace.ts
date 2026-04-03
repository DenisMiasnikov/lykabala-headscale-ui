export const useDeleteNamespace = ({ onSuccess, onError }) => {
  async function deleteNamespace(id: string, name: string) {
    const ok = window.confirm(
      `Delete namespace "${name}"? This cannot be undone.`,
    );
    if (!ok) return;

    const res = await fetch(`/api/namespaces/${id}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      onError(data.error || "Failed to delete namespace");
      // setError(data.error || "Failed to delete namespace");
      return;
    }
    onSuccess("Namespace deleted");
    // setMessage("Namespace deleted");
    // await loadData();
  }
};
