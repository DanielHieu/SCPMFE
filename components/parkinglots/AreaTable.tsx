// components/features/parking-lots/[lotId]/AreaTable.tsx
"use client";

import React from "react";
import { Area } from "@/types";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

interface AreaTableProps {
  areas: Area[];
  expandedAreaId: number | null;
  onExpandClick: (areaId: number) => void; // Function to toggle expansion
  onEditArea: (area: Area) => void;
  onDeleteArea: (areaId: number) => void;
  onAddFloorClick: (areaId: number) => void;
}

export function AreaTable({
  areas,
  expandedAreaId,
  onExpandClick,
  onEditArea,
  onDeleteArea,
  onAddFloorClick,
}: AreaTableProps) {
  // Define Area Columns
  const columns = React.useMemo<ColumnDef<Area>[]>(
    () => [
      {
        id: "expander",
        header: "",
        size: 40,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              onExpandClick(row.original.areaId);
            }}
          >
            {expandedAreaId === row.original.areaId ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </Button>
        ),
      },
      { accessorKey: "areaName", header: "Area Name" },
      { accessorKey: "totalFloor", header: "Floors" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === 1 ? "default" : "outline"}>
            {row.original.status === 1 ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        size: 80,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditArea(row.original)}>
                  Edit Area
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAddFloorClick(row.original.areaId)}
                >
                  Add Floor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteArea(row.original.areaId)}
                  className="text-red-600"
                >
                  Delete Area
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [expandedAreaId, onExpandClick, onEditArea, onDeleteArea, onAddFloorClick],
  );

  const table = useReactTable({
    data: areas || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              // Don't need React.Fragment here anymore as expansion is handled by parent
              <TableRow
                key={row.id}
                data-state={
                  expandedAreaId === row.original.areaId && "selected"
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No areas found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
