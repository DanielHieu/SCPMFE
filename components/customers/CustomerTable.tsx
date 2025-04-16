"use client";

import { Customer } from "@/types";
import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface CustomerTableProps {
  customers: Customer[];
  onEditClick: (customer: Customer) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function CustomerTable({
  customers,
  isLoading,
  error,
  onEditClick,
  onRefresh,
}: CustomerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Customer>[] = React.useMemo(
    () => [
      {
        header: "Tên Khách Hàng",
        accessorKey: "name", // Sort/filter primarily by name
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
            {/* Display username if available */}
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
        accessorKey: "email", // Sort/filter primarily by email
        cell: ({ row }) => (
          <div>
            <div>{row.original.email}</div>
            <div className="text-sm text-gray-500">{row.original.phone}</div>
          </div>
        ),
      },
      {
        header: "Trạng Thái",
        accessorKey: "isActive",
        cell: ({ row }) => {
          const isActive = row.getValue("isActive");
          return (
            <Badge variant="secondary" className={isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}>
              {isActive ? "Đang hoạt động" : "Không hoạt động"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex justify-end">
              <Link href={`/customers/${customer.customerId}`} className="flex items-center">
                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                Xem chi tiết
              </Link>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: customers || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Handle loading and error states
  if (isLoading) {
    return <div className="text-center py-4">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Lỗi: {error}
        <Button onClick={onRefresh} className="ml-2">
          Thử lại
        </Button>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không tìm thấy khách hàng nào.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-slate-200 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap text-slate-700 font-medium py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                  className="h-24 text-center text-slate-500"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        >
          Tiếp
        </Button>
      </div>
    </>
  );
}
