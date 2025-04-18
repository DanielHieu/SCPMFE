"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { searchStaff, addStaff, updateStaff } from "@/lib/api";
import { Staff, AddStaffPayload, UpdateStaffPayload } from "@/types";
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
import { ListFilter, PlusCircle, Search } from "lucide-react";
import {
  Breadcrumb,
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
import { toast } from "sonner";

type FilterStatus = "all" | "active" | "inactive";

export default function StaffPage() {
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchStaff = useCallback(async (term: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchStaff({ keyword: term ?? "" });
      setAllStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu nhân viên");
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
    formData: AddStaffPayload,
  ) => {
    try {
      await addStaff(formData);

      setIsAddModalOpen(false);

      refreshData();

      toast.success("Thêm nhân viên thành công!");
    } catch (error) {
      console.error("Không thể thêm nhân viên:", error);
      toast.error(
        `Lỗi khi thêm nhân viên: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
      );
    }
  };

  // Handler for editing staff
  const handleEditClick = (staff: Staff) => {
    setEditingStaff(staff);
    setIsEditModalOpen(true);
  };

  // Handler for updating staff
  const handleUpdateStaff = async (formData: Omit<UpdateStaffPayload, 'staffId'>) => {
    if (!editingStaff) {
      toast.error("Lỗi: Không tìm thấy nhân viên đang chỉnh sửa.");
      return;
    }

    const payload: UpdateStaffPayload = {
      ...formData,
      staffId: editingStaff.staffId,
    };

    try {
      await updateStaff(payload);

      setIsEditModalOpen(false);
      setEditingStaff(null);
      refreshData();

      toast.success("Cập nhật nhân viên thành công!");
    } catch (error) {
      console.error("Không thể cập nhật nhân viên:", error);
      toast.error(
        `Lỗi khi cập nhật nhân viên: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
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
    all: `Tất cả nhân viên (${counts.all})`,
    active: `Đang hoạt động (${counts.active})`,
    inactive: `Không hoạt động (${counts.inactive})`,
  };

  return (
    <div className="container mx-auto py-6 space-y-4 md:space-y-6">
      {/* Header & Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Quản lý nhân viên" }
        ]}
      />
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 px-1">
        Quản lý nhân viên
      </h1>

      {/* Filters and Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 px-1">
        {/* Search and Add */}
        <div className="w-full md:w-auto md:flex-grow lg:max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên/số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs h-9 pl-9"
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
                Lọc: {filterDisplayMap[filterStatus]}{" "}
                {/* Show current filter */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Use Radio items for single selection */}
              <DropdownMenuRadioGroup
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as FilterStatus)
                }
              >
                <DropdownMenuRadioItem value="all">
                  Tất cả nhân viên ({counts.all})
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">
                  Đang hoạt động ({counts.active})
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="inactive">
                  Không hoạt động ({counts.inactive})
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9">
                <PlusCircle className="w-4 h-4 mr-2" /> Thêm nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Thêm nhân viên mới</DialogTitle>
              </DialogHeader>
              <StaffForm onSubmitAction={handleAddStaff} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table Area */}
      <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-white">
        {isLoading && <div className="p-6 text-center">Đang tải dữ liệu nhân viên...</div>}
        {error && (
          <div className="p-6 text-center text-red-500">Lỗi: {error}</div>
        )}
        {!isLoading && !error && (
          <StaffTable
            staff={filteredStaff}
            refreshDataAction={refreshData}
            onEditClick={handleEditClick}
          />
        )}
      </div>

      {/* Edit Staff Dialog */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditingStaff(null);
          setIsEditModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <StaffForm
              onSubmitAction={handleUpdateStaff}
              initialData={editingStaff}
              onCancelAction={() => {
                setIsEditModalOpen(false);
                setEditingStaff(null);
              }}
              key={`edit-${editingStaff.staffId}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
