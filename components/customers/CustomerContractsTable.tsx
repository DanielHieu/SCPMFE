// components/features/customers/CustomerContractsTable.tsx
"use client";

import React from "react";
import { Contract } from "@/types";
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
import { PlusCircle } from "lucide-react"; // Icon for add button

interface CustomerContractsTableProps {
  contracts: Contract[];
  onAddContractClickAction: () => void; // Function to open the Add Contract modal
}

export function CustomerContractsTable({
  contracts,
  onAddContractClickAction,
}: CustomerContractsTableProps) {
  // Define Table Columns based on Contract type and expected display
  const columns = React.useMemo<ColumnDef<Contract>[]>(
    () => [
      // Adjust accessorKey and formatting based on your Contract type
      { accessorKey: "contractId", header: "ID" }, // Example: Assuming 'contractId' exists
      { accessorKey: "parkingSpaceName", header: "Lot" }, // Example: Need name from related space? Or display space ID? Adjust as needed.
      {
        header: "Period",
        cell: ({ row }) =>
          `${formatDate(row.original.startDate)} - ${formatDate(row.original.endDate)}`, // Example: Format dates
      },
      {
        accessorKey: "vehicleModel",
        header: "Vehicle",
        cell: ({ row }) =>
          `${row.original.car.model || "N/A"} (${row.original.car.licensePlate || "N/A"})`,
      }, // Example: Assuming license plate is available directly or via relation
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status as number | string; // Handle potential number/string status
          // Map status codes/strings to text and badge variants
          let text = "Unknown";
          let variant: "default" | "secondary" | "destructive" | "outline" =
            "secondary";
          // Example mapping (adjust based on your actual status values)
          if (status === 1 || String(status).toLowerCase().includes("active")) {
            text = "Active";
            variant = "default";
          } else if (
            status === 2 ||
            String(status).toLowerCase() === "inactive"
          ) {
            text = "Inactive";
            variant = "destructive";
          } else if (
            status === 3 ||
            String(status).toLowerCase() === "expired"
          ) {
            text = "Expired";
            variant = "outline";
          } // Add other statuses...

          return <Badge variant={variant}>{text}</Badge>;
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
      return "Invalid Date";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-medium">Parking Contracts</CardTitle>
        {/* Button to trigger the modal via prop function */}
        <Button size="sm" variant="outline" onClick={onAddContractClickAction}>
          <PlusCircle className="w-4 h-4 mr-2" /> Create Contract
        </Button>
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
                    No contracts found for this customer.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between space-x-2 pt-4">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
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
      </CardContent>
    </Card>
  );
}
