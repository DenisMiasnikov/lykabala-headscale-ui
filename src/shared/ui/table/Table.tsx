import React from "react";
import useTable from "./useTable";

export interface ITableColumn<T> {
  key: string;
  label?: string;
  sorter?: (a: T, b: T) => number;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

export interface ITableProps<T> {
  columns: ITableColumn<T>[];
  data: T[];
  rowKey?: keyof T;
  paginationParams?: {
    pageSize?: number;
  };
}

const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = "id",
  paginationParams,
}: ITableProps<T>) => {
  const {
    data: processedData,
    total,
    sortConfig,
    setSortConfig,
    page,
    setPage,
  } = useTable({
    data,
    columns,
    initialPageSize: paginationParams?.pageSize,
  });

  const totalPages = Math.ceil(total / paginationParams?.pageSize);

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns?.map((col) => {
              const isSorted = sortConfig?.key === col.key;

              return (
                <th
                  key={col.key}
                  onClick={() => {
                    if (!col.sorter) return;

                    setSortConfig((prev) => ({
                      key: col.key,
                      order:
                        prev?.key === col.key && prev.order === "asc"
                          ? "desc"
                          : "asc",
                    }));
                  }}
                  style={{ cursor: col.sorter ? "pointer" : "default" }}
                >
                  {col.label}
                  {isSorted && (sortConfig.order === "asc" ? " 🔼" : " 🔽")}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {processedData?.length === 0 ? (
            <tr>
              <td colSpan={columns?.length}>No data</td>
            </tr>
          ) : (
            processedData?.map((row) => (
              <tr key={row[rowKey]} className={row.className}>
                {columns?.map((col) => {
                  const value = row[col.key];

                  return (
                    <td key={col.key} className={col.className}>
                      {col.render ? col.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {paginationParams && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Prev
          </button>

          <span>
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
