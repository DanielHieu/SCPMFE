// components/features/staff/StaffTable.tsx
"use client";
import React, { useState } from "react";
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
  onEditClick?: (staff: Staff) => void;
}

export function StaffTable({ staff, refreshDataAction, onEditClick }: StaffTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleDelete = async (staffAccountId: number) => {
    if (window.confirm("Bạn có chắc chắn? Hành động này sẽ xóa nhân viên.")) {
      try {
        await deleteStaff(staffAccountId); // Use the correct ID
        alert("Đã xóa nhân viên");
        refreshDataAction();
      } catch (error) {
        alert(
          `Xóa thất bại: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
        );
      }
    }
  };

  // Define Columns matching stafflist.png and API data
  const columns = React.useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        header: "Nhân viên",
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
        header: "Thông tin liên hệ",
        accessorKey: "email", // Sort by email
        cell: ({ row }) => (
          <div>
            <div>{row.original.email}</div>
            <div className="text-sm text-gray-500">{row.original.phone}</div>
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => {
          const isActive = row.getValue("isActive");
          return (
            <Badge variant={isActive ? "secondary" : "destructive"} className={isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}>
              {isActive ? "Đang hoạt động" : "Không hoạt động"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const currentStaff = row.original;
          const isActive = currentStaff.isActive;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full">
                    <span className="sr-only">Mở menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-md shadow-md">
                  {onEditClick && (
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-slate-50" 
                      onClick={() => onEditClick(currentStaff)}
                    >
                      <Edit className="mr-2 h-4 w-4 text-slate-500" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/staffs/${currentStaff.staffId}`}>
                      <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete(currentStaff.staffId)}
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
    [onEditClick],
  );

  const table = useReactTable({
    data: staff || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // Set a fixed number of items per page
      },
    },
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
                  Không tìm thấy nhân viên nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2 p-4 border-t">
        <div className="text-sm text-muted-foreground">
          Hiển thị {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, staff.length)} trong số {staff.length} nhân viên
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Tiếp
          </Button>
        </div>
      </div>
    </>
  );
}
