import { useMemo, useState } from "react";

export const useTable = ({ data, columns, initialPageSize = 5 }) => {
  const [sortConfig, setSortConfig] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const col = columns.find((c) => c.key === sortConfig.key);
    if (!col?.sorter) return data;

    return [...data].sort((a, b) =>
      sortConfig.order === "asc" ? col.sorter(a, b) : col.sorter(b, a),
    );
  }, [data, sortConfig, columns]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  return {
    data: paginatedData,
    total: sortedData.length,

    sortConfig,
    setSortConfig,

    page,
    setPage,

    pageSize,
    setPageSize,
  };
};
