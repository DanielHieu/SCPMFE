// components/features/parking-lots/[lotId]/NestedTableDisplay.tsx
"use client";

import React from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react"; // Example Icon

interface NestedTableDisplayProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading: boolean;
  noDataMsg: string;
  // Props for handling expansion of the *next* level down
  expandedRowState?: Record<string, boolean>;
  toggleExpand?: (
    id: string,
    type: "floor" | "space",
    entityId: number,
  ) => void; // Type might need adjustment
  childDataCache?: Record<string, { data: any[]; isLoading: boolean }>;
  childColumns?: ColumnDef<any>[];
  childEntityName?: string; // e.g., "Spaces"
  parentEntityIdKey?: keyof TData; // e.g., 'floorId'
  // Handlers for child CRUD actions
  onAddChildClick?: (parentId: number) => void;
  // Pass down onEditChildClick, onDeleteChildClick as needed
}

export function NestedTableDisplay<TData extends { [key: string]: any }>({
  data,
  columns,
  isLoading,
  noDataMsg,
  expandedRowState = {}, // Default to empty object
  toggleExpand, // Function to toggle next level
  childDataCache = {}, // Cache for next level data
  childColumns = [], // Columns for next level table
  childEntityName = "",
  parentEntityIdKey, // The ID key of the current data type (e.g., floorId)
  onAddChildClick,
}: NestedTableDisplayProps<TData>) {
  const table = useReactTable({
    data: data || [], // Ensure data is array
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 animate-pulse">
        Loading...
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">{noDataMsg}</div>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table size="sm">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            // Construct ID for expansion state and cache based on parent key
            const entityId = parentEntityIdKey
              ? row.original[parentEntityIdKey]
              : null;
            const expanderId = entityId
              ? `${childEntityName?.toLowerCase()}-${entityId}`
              : ""; // e.g., "floor-5" or "space-101"
            const isExpanded = expanderId && !!expandedRowState[expanderId];
            const nextLevelCacheKey = expanderId
              ? `${expanderId}-${childEntityName ? childEntityName.toLowerCase() : "items"}`
              : ""; // e.g., "floor-5-spaces"
            const nextLevelData = childDataCache[nextLevelCacheKey];

            return (
              <React.Fragment key={row.id}>
                <TableRow data-state={isExpanded && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {/* --- Conditional Rendering for NEXT level --- */}
                {isExpanded && childColumns.length > 0 && parentEntityIdKey && (
                  <TableRow className="bg-gray-100/50 hover:bg-gray-100/80">
                    <TableCell colSpan={columns.length} className="p-0">
                      <div className="p-3 space-y-2">
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-semibold text-sm">
                            {childEntityName}
                          </h5>
                          {onAddChildClick && entityId && (
                            <Button
                              size="lg"
                              variant="outline"
                              onClick={() => onAddChildClick(entityId)}
                            >
                              <PlusCircle size={14} className="mr-1" />
                              Add {childEntityName}
                            </Button>
                          )}
                        </div>
                        {/* Recursively render or render specific Space table */}
                        <NestedTableDisplay
                          data={nextLevelData?.data || []}
                          columns={childColumns}
                          isLoading={!!nextLevelData?.isLoading}
                          noDataMsg={`No ${childEntityName} found.`}
                          // Pass necessary props down if supporting further nesting
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
