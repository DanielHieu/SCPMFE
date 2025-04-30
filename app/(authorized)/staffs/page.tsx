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
import { ListFilter, PlusCircle, Search, Plus } from "lucide-react";
import {
  Breadcrumb,
} from "@/components/ui/breadcrumb";
import {
  Tabs, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs";
import { toast, Toaster } from "sonner";

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
    const activeField = "isActive"; // Changed from isActived to isActive to match StaffTable
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
    const activeField = "isActive"; // Changed from isActived to isActive
    return {
      all: allStaff.length,
      active: allStaff.filter((s) => s[activeField as keyof Staff]).length,
      inactive: allStaff.filter((s) => !s[activeField as keyof Staff]).length,
    };
  }, [allStaff]);

  return (
    <>
      <Toaster position="top-right" />
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/dashboard" },
            { label: "Quản lý nhân viên" }
          ]}
        />

        {/* Unified container with white background */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* Header section with Add Button */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý nhân viên
            </h1>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
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

          {/* Search section */}
          <div className="px-6 pt-4 pb-2 border-b border-gray-200">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên/số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-9 pr-4 w-full"
              />
            </div>
          </div>

          {/* Gmail-style tabs - directly above the table with no gap */}
          <div className="border-b border-gray-200">
            <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)} className="w-full">
              <TabsList className="h-12 bg-transparent p-0 flex w-full justify-start rounded-none border-0">
                <TabsTrigger 
                  value="all" 
                  className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                >
                  Tất cả ({counts.all})
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                >
                  Đang hoạt động ({counts.active})
                </TabsTrigger>
                <TabsTrigger 
                  value="inactive" 
                  className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                >
                  Không hoạt động ({counts.inactive})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table area - no padding to connect directly with tabs */}
          <div className="pb-0">
            {isLoading && (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2 text-gray-500">Đang tải dữ liệu nhân viên...</p>
              </div>
            )}
            {error && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                  <span className="text-red-500 text-xl">!</span>
                </div>
                <p className="text-red-500">Lỗi: {error}</p>
              </div>
            )}
            {!isLoading && !error && (
              <StaffTable
                staff={filteredStaff}
                refreshDataAction={refreshData}
                onEditClick={handleEditClick}
              />
            )}
          </div>
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
    </>
  );
}
