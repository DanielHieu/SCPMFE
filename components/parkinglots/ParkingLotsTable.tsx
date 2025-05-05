// components/features/parking-lots/ParkingLotsTable.tsx
"use client";
import React from "react";
import { ParkingLot } from "@/types";
// ... imports (TanStack Table, UI Components, Icons, DropdownMenu) ...
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface ParkingLotsTableProps {
  lots: ParkingLot[];
  onEditAction: (lot: ParkingLot) => void;
  onDeleteAction: (id: number) => void;
}

// Helper function (move to utils)
const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "0 ₫";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export function ParkingLotsTable({
  lots,
  onEditAction,
  onDeleteAction,
}: ParkingLotsTableProps) {
  // ... table state (sorting etc.) ...

  const columns = React.useMemo<ColumnDef<ParkingLot>[]>(
    () => [
      { accessorKey: "parkingLotId", header: "ID", size: 50 }, // Example size
      {
        accessorKey: "name",
        header: "Tên bãi đỗ xe",
        size: 200,
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.parkingLotName || "Chưa đặt tên"}
          </span>
        ),
      },
      {
        accessorKey: "address",
        header: "Địa chỉ",
        size: 400,
        cell: ({ row }) => (
          <span className="whitespace-normal break-words">
            {row.original.address}
          </span>
        ),
      },
      {
        id: "pricing", // Combined pricing column
        header: "Giá (Giờ / Ngày / Tháng)",
        // No accessorKey needed if using custom cell rendering from original data
        cell: ({ row }) => (
          <ul className="list-none p-0 m-0 text-xs">
            <li>
              <span className="font-semibold text-gray-600">Giờ:</span>{" "}
              {formatCurrency(row.original.pricePerHour)}
            </li>
            <li>
              <span className="font-semibold text-gray-600">Ngày:</span>{" "}
              {formatCurrency(row.original.pricePerDay)}
            </li>
            <li>
              <span className="font-semibold text-gray-600">Tháng:</span>{" "}
              {formatCurrency(row.original.pricePerMonth)}
            </li>
          </ul>
        ),
        size: 150, // Adjust size
      },
      // Add Lat/Long columns if desired
      // { accessorKey: 'lat', header: 'Vĩ độ' },
      // { accessorKey: 'long', header: 'Kinh độ' },
      {
        id: "actions",
        header: () => <div className="text-right">Thao tác</div>,
        size: 80,
        cell: ({ row }) => {
          const lot = row.original;
          const parkinglotId = lot.parkingLotId;
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
                    <Link href={`/parkinglots/${parkinglotId}`}>
                      <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onEditAction(lot)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={() => onDeleteAction(lot.parkingLotId)}
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
    [onEditAction, onDeleteAction],
  );

  const table = useReactTable({
    data: lots || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
      // enable sorting etc. if needed
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
                  Không tìm thấy bãi đỗ xe nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
          {/*<div className="flex items-center justify-between space-x-2 p-4 border-t">*/}
        {/* ... Pagination UI ... */}
          {/*</div>*/}
          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-3 border-t">
              <div className="text-sm text-gray-500">
                  Hiển thị {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                  {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, customers.length)} trong số {customers.length} khách hàng
              </div>
              <div className="space-x-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="border-gray-200 text-gray-600"
                  >
                      Trước
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="border-gray-200 text-gray-600"
                  >
                      Tiếp
                  </Button>
              </div>
          </div>
    </>
  );
}
