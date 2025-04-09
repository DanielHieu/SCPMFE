// components/features/parking-lots/[lotId]/SpaceTable.tsx
"use client";

import React from "react";
import { ParkingSpace, ParkingSpaceStatus } from "@/types"; // Use your ParkingSpace type
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpaceTableProps {
  spaces: ParkingSpace[];
  isLoading: boolean;
  onEditSpace: (space: ParkingSpace) => void;
  onDeleteSpace: (spaceId: number) => void;
}

export function SpaceTable({
  spaces,
  isLoading,
  onEditSpace,
  onDeleteSpace,
}: SpaceTableProps) {
  // Define Space Columns based on confirmed ParkingSpace type and status mapping
  const columns = React.useMemo<ColumnDef<ParkingSpace>[]>(
    () => [
      // Ensure accessorKey matches your ParkingSpace type fields
      { accessorKey: "parkingSpaceName", header: "Space Name", size: 200 },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => {
          const isAvailable = row.original.status === ParkingSpaceStatus.Available; // 0 = Available, 1 = Not Available
          return (
            <Badge
              variant={isAvailable ? "default" : "secondary"}
              className={cn(
                isAvailable
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800",
              )}
            >
              {isAvailable ? "Available" : "Not Available"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        size: 80,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onEditSpace(row.original)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Space
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => onDeleteSpace(row.original.parkingSpaceId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Space
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [onEditSpace, onDeleteSpace],
  );

  const table = useReactTable({
    data: spaces || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="p-3 text-center text-xs text-gray-500 animate-pulse">
        Loading Spaces...
      </div>
    );
  }
  if (!isLoading && spaces.length === 0) {
    return (
      <div className="p-3 text-center text-xs text-gray-500">
        No spaces found for this floor.
      </div>
    );
  }

  return (
    // Apply some padding/margin if needed when nested
    <div className="rounded-md border bg-white my-1 ml-4">
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
                  className="py-1 text-xs h-8 font-semibold bg-gray-50"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-1 text-xs">
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
