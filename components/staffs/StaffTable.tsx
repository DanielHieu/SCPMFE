// components/features/staff/StaffTable.tsx
"use client";
import React from "react";
import { Staff } from "@/types"; // Use your Staff type
import { deleteStaff } from "@/lib/api";
// ... imports for TanStack Table, UI Components (Table, Button, Badge, DropdownMenu), Icons ...
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"; // Eye icon removed as no details page mentioned
import Link from "next/link";

interface StaffTableProps {
  staff: Staff[];
  refreshDataAction: () => void;
}

export function StaffTable({ staff, refreshDataAction }: StaffTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const handleDelete = async (staffAccountId: number) => {
    if (window.confirm("Are you sure? This will delete the staff member.")) {
      try {
        await deleteStaff(staffAccountId); // Use the correct ID
        alert("Staff member deleted");
        refreshDataAction();
      } catch (error) {
        alert(
          `Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  };

  // Define Columns matching stafflist.png and API data
  const columns = React.useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        header: "Staff",
        accessorKey: "firstName", // Sort by first name
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
            {row.original.username && (
              <div className="text-sm text-gray-500">
                @{row.original.username}
              </div>
            )}
          </div>
        ),
      },
      {
        header: "Contact Information",
        accessorKey: "email", // Sort by email
        cell: ({ row }) => (
          <div>
            <div>{row.original.email}</div>
            <div className="text-sm text-gray-500">{row.original.phone}</div>
          </div>
        ),
      },
      {
        // IMPORTANT: Check the exact boolean field name in your Staff type ('isActive' or 'isActived')
        accessorKey: "isActived", // Or 'isActive'
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("isActived"); // Or 'isActive'
          return (
            <Badge variant={isActive ? "default" : "outline"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const staffMember = row.original;
          // Assuming ID field is staffAccountId based on Update/Delete API [cite: 286, 183]
          const staffId = staffMember.staffId;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Add View Details link later if a details page is created */}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/staffs/${staffId}`}>
                      <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      alert(`Edit action for Staff ID: ${staffId}`)
                    } // Placeholder for Edit modal
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete(staffId)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Xoá
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: staff || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2 p-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {staff.length} staff
          members
          {/* Adjust if using server-side pagination */}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
