// components/features/customers/CustomerContractsTable.tsx
"use client";

import React from "react";
import { Contract, ContractStatus } from "@/types/contract";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel, // Import for pagination
  useReactTable,
} from "@tanstack/react-table";

// Import Shadcn UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CustomerContractsTableProps {
  contracts: Contract[]
}

export function CustomerContractsTable({
  contracts
}: CustomerContractsTableProps) {
  // Define Table Columns based on Contract type and expected display
  const columns = React.useMemo<ColumnDef<Contract>[]>(
    () => [
      // Adjust accessorKey and formatting based on your Contract type
      { accessorKey: "contractId", header: "ID" }, // Example: Assuming 'contractId' exists
      { accessorKey: "parkingSpaceName", header: "Bãi đỗ" }, // Example: Need name from related space? Or display space ID? Adjust as needed.
      {
        header: "Thời hạn",
        cell: ({ row }) =>
          `${formatDate(row.original.startDate)} - ${formatDate(row.original.endDate)}`, // Example: Format dates
      },
      {
        accessorKey: "vehicleModel",
        header: "Phương tiện",
        cell: ({ row }) =>
          `${row.original.car.model || "N/A"} (${row.original.car.licensePlate || "N/A"})`,
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const status = row.original.status;
          // Map status codes/strings to text and badge variants
          let text = "Không xác định";
          let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
          let className = "";

          // Use ContractStatus enum for better type safety
          switch (status) {
            case ContractStatus.Active:
              text = "Đang hoạt động";
              variant = "default";
              className = "bg-green-100 text-green-800";
              break;
            case ContractStatus.Inactive:
              text = "Chờ xử lý";
              variant = "secondary";
              className = "bg-yellow-100 text-yellow-800";
              break;
            case ContractStatus.Expired:
              text = "Hết hạn";
              variant = "outline";
              className = "bg-red-100 text-red-800";
              break;
            case ContractStatus.PendingActivation:
              text = "Chờ kích hoạt";
              variant = "secondary";
              className = "bg-blue-100 text-blue-800";
              break;
            default:
              text = status || "Không xác định";
              break;
          }

          return <Badge variant={variant} className={className}>{text}</Badge>;
        },
      },
      // Add an actions column here if needed (e.g., view contract details, terminate)
    ],
    [],
  );

  const table = useReactTable({
    data: contracts || [], // Ensure data is an array
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Enable pagination
    initialState: {
      // Optional: Set initial page size
      pagination: {
        pageSize: 5, // Show 5 rows per page
      },
    },
  });

  // Helper functions (consider moving to lib/utils.ts)
  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB"); // Format as dd/mm/yyyy
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-medium">Hợp đồng đỗ xe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
                    Không tìm thấy hợp đồng nào cho khách hàng này.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between space-x-2 pt-4">
          <div className="text-sm text-muted-foreground">
            Trang {table.getState().pagination.pageIndex + 1} của{" "}
            {table.getPageCount()}
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
              Sau
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
