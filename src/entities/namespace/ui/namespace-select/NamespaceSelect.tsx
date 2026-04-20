import {Select} from "../../../../shared/ui/select/Select";
import {useEffect, useState} from "react";
import type {Namespace} from "../../types";

export const NamespaceSelect = ({value,onChange, placeholder='Select user' }) => {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [_namespacesLoading, setNamespacesLoading] = useState(true);
  const [_namespacesError, setNamespacesError] = useState<string | null>(null);

  async function loadNamespaces() {
    setNamespacesError(null);
    setNamespacesLoading(true);
    try {
      const res = await fetch("/api/internal/namespaces");
      const data = await res.json();
      if (!res.ok) {
        new Error(data.error || "Failed to load namespaces");
      }
      const list = Array.isArray(data.namespaces) ? data.namespaces : [];
      setNamespaces(list);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load namespaces";
      setNamespacesError(message);
    } finally {
      setNamespacesLoading(false);
    }
  }

  useEffect(() => {
    loadNamespaces();
  }, []);

  useEffect(() => {
    if (!value && namespaces.length > 0) {
      onChange(namespaces[0].name);
    }
  }, [namespaces, value]);

  return (
    <Select
      value={value}
      onChange={onChange}
      items={namespaces.map(({id, name}) => ({label: name, value: id}))}
      placeholder={placeholder}
    />
  )
}
