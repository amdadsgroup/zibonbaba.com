'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, Trash2, Edit, CheckSquare, Square, Filter, ChevronDown, ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
  width?: string;
}

interface EnterpriseDataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  title?: string;
  isLoading?: boolean;
  bulkActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'danger' | 'primary' | 'secondary';
    onClick: (selectedRows: T[]) => void;
  }[];
  onRowClick?: (row: T) => void;
}

export default function EnterpriseDataTable<T extends { id: string | number }>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  title,
  isLoading = false,
  bulkActions,
  onRowClick
}: EnterpriseDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search Filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val || '').toLowerCase().includes(q)
      )
    );
  }, [data, search]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  // Bulk Selection
  const allSelected = paginatedData.length > 0 && paginatedData.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      paginatedData.forEach((r) => next.delete(r.id));
    } else {
      paginatedData.forEach((r) => next.add(r.id));
    }
    setSelectedIds(next);
  };

  const toggleSelectRow = (id: string | number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedRows = useMemo(() => {
    return data.filter((r) => selectedIds.has(r.id));
  }, [data, selectedIds]);

  const handleSort = (key?: string) => {
    if (!key) return;
    if (sortField === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-card overflow-hidden text-slate-200">
      {/* Header Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40">
        <div className="flex items-center gap-3">
          {title && <h3 className="text-base font-bold text-slate-100">{title}</h3>}
          <span className="text-xs font-mono bg-slate-800 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-700 font-semibold">
            {filteredData.length} records
          </span>
        </div>

        {/* Search input */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/30 cursor-pointer"
                />
              </th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`p-3.5 ${col.sortable ? 'cursor-pointer select-none hover:text-slate-200' : ''}`}
                  onClick={() => col.sortable && handleSort(col.sortKey || (typeof col.accessor === 'string' ? (col.accessor as string) : undefined))}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown className="w-3 h-3 opacity-60" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-3.5"><div className="w-4 h-4 bg-slate-800 rounded"></div></td>
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="p-3.5">
                      <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-10 text-center text-slate-500 font-medium">
                  No records match search parameters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isChecked = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      isChecked ? 'bg-amber-500/5' : 'hover:bg-slate-800/40'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectRow(row.id)}
                        className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/30 cursor-pointer"
                      />
                    </td>
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="p-3.5 font-medium text-slate-200">
                        {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as any)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && bulkActions && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-950 border border-amber-500/30 rounded-2xl px-6 py-3 shadow-modal flex items-center gap-4 text-xs animate-slide-up backdrop-blur-xl">
          <span className="font-bold text-slate-200">
            <span className="text-amber-400 font-mono font-black">{selectedIds.size}</span> item(s) selected
          </span>
          <div className="h-4 w-[1px] bg-slate-800"></div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => action.onClick(selectedRows)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  action.variant === 'danger'
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
        <div>
          Showing <span className="font-bold text-slate-200">{(page - 1) * pageSize + 1}</span> to{' '}
          <span className="font-bold text-slate-200">{Math.min(page * pageSize, sortedData.length)}</span> of{' '}
          <span className="font-bold text-slate-200">{sortedData.length}</span> entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-200">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
