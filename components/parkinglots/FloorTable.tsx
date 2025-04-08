// components/features/parking-lots/[lotId]/FloorTable.tsx
"use client";

import React from "react";
import { Floor } from "@/types"; // Use your Floor type
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { cn } from "@/lib/utils"; // If needed for custom styling

interface FloorTableProps {
  floors: Floor[];
  isLoading: boolean; // Loading state for the floor data itself
  expandedFloorId: number | null; // ID of the currently expanded floor (to show spaces)
  onExpandClick: (floorId: number) => void; // Function to toggle space visibility & trigger fetch
  onEditFloor: (floor: Floor) => void; // Function to trigger Edit Floor modal
  onDeleteFloor: (floorId: number) => void; // Function to trigger Delete Floor action
  onAddSpaceClick: (floorId: number) => void; // Function to trigger Add Space modal
}

export function FloorTable({
  floors,
  isLoading,
  expandedFloorId,
  onExpandClick,
  onEditFloor,
  onDeleteFloor,
  onAddSpaceClick,
}: FloorTableProps) {
  // Define Floor Columns based on confirmed Floor type and API response
  const columns = React.useMemo<ColumnDef<Floor>[]>(
    () => [
      {
        id: "expander",
        header: "",
        size: 40,
        cell: ({ row }) => (
          // Button to toggle expansion of spaces for this floor
          <Button
            variant="ghost"
            size="lg"
            className="w-6 h-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onExpandClick(row.original.floorId);
            }}
          >
            {expandedFloorId === row.original.floorId ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </Button>
        ),
      },
      { accessorKey: "floorName", header: "Floor Name", size: 150 },
      { accessorKey: "totalParkingSpace", header: "Total Spaces", size: 100 },
      {
        accessorKey: "numberEmptyParkingSpace",
        header: "Available",
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        cell: ({ row }) => (
          // Assuming status: 1 means Active
          <Badge variant={row.original.status === 1 ? "default" : "outline"}>
            {row.original.status === 1 ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        size: 80,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onEditFloor(row.original)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Floor
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onAddSpaceClick(row.original.floorId)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Space
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => onDeleteFloor(row.original.floorId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Floor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [
      expandedFloorId,
      onExpandClick,
      onEditFloor,
      onDeleteFloor,
      onAddSpaceClick,
    ],
  );

  const table = useReactTable({
    data: floors || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Loading and No Data states
  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 animate-pulse">
        Loading Floors...
      </div>
    );
  }
  // No Data handled here OR in parent - check consistency
  if (!isLoading && floors.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No floors found for this area.
      </div>
    );
  }

  return (
    // Apply some padding/margin if needed when nested
    <div className="rounded-md border bg-white my-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead
                  key={h.id}
                  style={{
                    width: h.getSize() !== 150 ? `${h.getSize()}px` : undefined,
                  }}
                  className="py-2 text-xs h-9 font-semibold"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            // Note: Expansion rendering for Spaces happens in AreaFloorSpaceManager
            // based on expandedFloorId matching row.original.floorId.
            <TableRow
              key={row.id}
              data-state={
                expandedFloorId === row.original.floorId && "selected"
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-2 text-xs">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
