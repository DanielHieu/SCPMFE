"use client";

import { Customer } from "@/types";
import {
  deleteCustomer,
  getCustomerContractCount,
  getCustomerPendingRequestCount,
} from "@/lib/api";
import { useEffect, useState } from "react";
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
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
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

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn không?")) {
      try {
        await deleteCustomer(id);
        alert("Đã xóa khách hàng");
        onRefresh();
      } catch (error) {
        alert(
          `Lỗi khi xóa: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
        );
      }
    }
  };

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
            <Badge variant={isActive ? "default" : "outline"}>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/customers/${customer.customerId}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </Link>
                  </DropdownMenuItem>
                  {/* Ensure onClick calls the prop */}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onEditClick(customer)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete(customer.customerId)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
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
                >
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
    </>
  );
}
