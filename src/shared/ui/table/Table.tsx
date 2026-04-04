import React, { useState, useMemo, useEffect } from "react";
import useTable from "./useTable";
import { ChevronRightIcon, ChevronDownIcon } from "../icons/Icons";

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
  // Grouping props
  groupBy?: keyof T | ((item: T) => string);
  renderGroupHeader?: (
    groupName: string,
    items: T[],
    isExpanded: boolean,
    toggle: () => void
  ) => React.ReactNode;
  expandedGroups?: Set<string>;
  defaultExpandedGroups?: string[];
  onExpandedGroupsChange?: (groups: Set<string>) => void;
  // Row styling
  rowClassName?: string | ((row: T) => string);
}

const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = "id",
  paginationParams,
  groupBy,
  renderGroupHeader,
  expandedGroups: controlledExpanded,
  defaultExpandedGroups = [],
  onExpandedGroupsChange,
  rowClassName,
}: ITableProps<T>) => {
  const isGrouped = !!groupBy;
  const enablePagination = !!paginationParams;

  // Determine initial page size: if grouped or no pagination, show all data
  const initialPageSize = isGrouped || !enablePagination
    ? data?.length || 0
    : paginationParams?.pageSize || 5;

  const {
    data: processedData,
    total,
    sortConfig,
    setSortConfig,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useTable({
    data,
    columns,
    initialPageSize,
  });

  // Sync pageSize with data length when pagination is disabled
  useEffect(() => {
    if (!enablePagination) {
      setPageSize(data?.length || 0);
    }
  }, [data?.length, enablePagination, setPageSize]);

  // Reset to page 1 when data changes significantly (e.g., after delete)
  useEffect(() => {
    if (page > 1 && total <= (page - 1) * pageSize) {
      setPage(1);
    }
  }, [total, page, pageSize, setPage]);

  const totalPages = Math.ceil(total / pageSize);

  // State for expanded groups (uncontrolled mode)
  const [internalExpanded, setInternalExpanded] =
    useState<Set<string>>(new Set(defaultExpandedGroups));
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;
  const setExpanded = (newSet: Set<string>) => {
    if (isControlled && onExpandedGroupsChange) {
      onExpandedGroupsChange(newSet);
    } else {
      setInternalExpanded(newSet);
    }
  };

  // Toggle a group
  const toggleGroup = (groupName: string) => {
    const next = new Set(expanded);
    if (next.has(groupName)) {
      next.delete(groupName);
    } else {
      next.add(groupName);
    }
    setExpanded(next);
  };

  // Group data if needed
  const groupedData = useMemo(() => {
    if (!isGrouped) return null;
    const groups: Record<string, T[]> = {};
    processedData.forEach((item) => {
      const key =
        typeof groupBy === "function"
          ? groupBy(item)
          : String((item as any)[groupBy] ?? "Unassigned");
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    // Sort group keys alphabetically, with 'Unassigned' last
    const keys = Object.keys(groups).sort((a, b) => {
      if (a === "Unassigned") return 1;
      if (b === "Unassigned") return -1;
      return a.localeCompare(b);
    });
    return { groups, keys };
  }, [processedData, groupBy, isGrouped]);

  // Render helper for table body
  const renderTableBody = (rows: T[]) => (
    <tbody>
      {rows?.length === 0 ? (
        <tr>
          <td colSpan={columns?.length}>No data</td>
        </tr>
      ) : (
        rows?.map((row) => {
          const key = row[rowKey] as string | number;
          // Determine row class
          let rowClass = row.className as string | undefined;
          if (rowClassName) {
            if (typeof rowClassName === "function") {
              rowClass = rowClass ? `${rowClass} ${rowClassName(row)}` : rowClassName(row);
            } else {
              rowClass = rowClass ? `${rowClass} ${rowClassName}` : rowClassName;
            }
          }
          return (
            <tr key={key} className={rowClass}>
              {columns?.map((col) => {
                const value = row[col.key];
                return (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(value as any, row) : (value as any)}
                  </td>
                );
              })}
            </tr>
          );
        })
      )}
    </tbody>
  );

  // Render
  if (isGrouped && groupedData) {
    return (
      <div className="user-groups">
        {groupedData.keys.map((groupName) => {
          const groupItems = groupedData.groups[groupName];
          const isExpanded = expanded.has(groupName);
          const toggle = () => toggleGroup(groupName);
          // Group header
          const headerContent = renderGroupHeader
            ? renderGroupHeader(groupName, groupItems, isExpanded, toggle)
            : (
                <div className="user-group-header" onClick={toggle}>
                  <div className="user-group-info">
                    <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
                      {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </span>
                    <span className="user-name">{groupName}</span>
                  </div>
                </div>
              );
          return (
            <div key={groupName} className="user-group">
              {headerContent}
              {isExpanded && (
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
                    {renderTableBody(groupItems)}
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Normal (non-grouped) table
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
        {renderTableBody(processedData)}
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
