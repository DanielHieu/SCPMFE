"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { searchStaff, registerStaff } from "@/lib/api";
import { Staff, RegisterStaffPayload } from "@/types";
import { StaffTable } from "@/components/staffs/StaffTable";
import { StaffForm } from "@/components/staffs/StaffForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useDebounce from "@/hooks/useDebounce";
import { ListFilter, PlusCircle } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterStatus = "all" | "active" | "inactive";

export default function StaffPage() {
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchStaff = useCallback(async (term: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchStaff({ keyword: term ?? "" });
      setAllStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
      setAllStaff([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchStaff]);

  const filteredStaff = useMemo(() => {
    // IMPORTANT: Check the exact boolean field name in your Staff type ('isActive' or 'isActived')
    const activeField = "isActived"; // Or 'isActive' if that's the actual field name
    if (filterStatus === "active") {
      return allStaff.filter((s) => s[activeField as keyof Staff]);
    }
    if (filterStatus === "inactive") {
      return allStaff.filter((s) => !s[activeField as keyof Staff]);
    }
    return allStaff; // 'all'
  }, [allStaff, filterStatus]);

  const refreshData = useCallback(() => {
    fetchStaff(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchStaff]);

  // Handler for submitting the Add Staff form
  const handleAddStaff = async (
    formData: Omit<RegisterStaffPayload, "ownerId">,
  ) => {
    // Assuming ownerId comes from session or context
    const ownerId = 1; // Replace with actual owner ID logic
    try {
      await registerStaff({ ...formData, ownerId: ownerId });
      setIsAddModalOpen(false);
      refreshData();
      alert("Staff member added successfully!");
    } catch (error) {
      console.error("Failed to add staff:", error);
      alert(
        `Error adding staff: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Calculate counts for filter tabs
  const counts = useMemo(() => {
    const activeField = "isActived"; // Or 'isActive'
    return {
      all: allStaff.length,
      active: allStaff.filter((s) => s[activeField as keyof Staff]).length,
      inactive: allStaff.filter((s) => !s[activeField as keyof Staff]).length,
    };
  }, [allStaff]);

  // Map filter status to display text
  const filterDisplayMap: Record<FilterStatus, string> = {
    all: `All Staff (${counts.all})`,
    active: `Active (${counts.active})`,
    inactive: `Inactive (${counts.inactive})`,
  };

  return (
    <div className="container mx-auto py-6 space-y-4 md:space-y-6">
      {/* Header & Breadcrumbs */}
      <Breadcrumb className="mb-4 px-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Owner Side</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Staff Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 px-1">
        Staff Management
      </h1>

      {/* Filters and Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 px-1">
        {/* Filter Tabs */}
        {/* <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All Staffs ({counts.all})
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
          >
            Active ({counts.active})
          </Button>
          <Button
            variant={filterStatus === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("inactive")}
          >
            Inactive ({counts.inactive})
          </Button>
        </div> */}

        {/* Search and Add */}
        <div className="w-full md:w-auto md:flex-grow lg:max-w-md">
          <Input
            placeholder="Search Name/Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs h-9"
          />
        </div>

        {/* Actions (Moved Right) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {" "}
          {/* Align buttons right */}
          {/* Filter Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <ListFilter className="w-4 h-4 mr-2" />
                Filter: {filterDisplayMap[filterStatus]}{" "}
                {/* Show current filter */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Use Radio items for single selection */}
              <DropdownMenuRadioGroup
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as FilterStatus)
                }
              >
                <DropdownMenuRadioItem value="all">
                  All Staffs ({counts.all})
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">
                  Active ({counts.active})
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="inactive">
                  Inactive ({counts.inactive})
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
              </DialogHeader>
              <StaffForm onSubmitAction={handleAddStaff} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table Area */}
      <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-white">
        {isLoading && <div className="p-6 text-center">Loading staff...</div>}
        {error && (
          <div className="p-6 text-center text-red-500">Error: {error}</div>
        )}
        {!isLoading && !error && (
          <StaffTable staff={filteredStaff} refreshDataAction={refreshData} />
        )}
      </div>
    </div>
  );
}
