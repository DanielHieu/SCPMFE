// app/(authorized)/parking-lots/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  searchParkingLots,
  addParkingLot,
  updateParkingLot,
  deleteParkingLot,
} from "@/lib/api";
import {
  ParkingLot,
  AddParkingLotPayload,
  UpdateParkingLotPayload,
} from "@/types";
import { ParkingLotsTable } from "@/components/parkinglots/ParkingLotsTable";
import { ParkingLotForm } from "@/components/parkinglots/ParkingLotForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import useDebounce from "@/hooks/useDebounce";
import { PlusCircle, Search, Car, AreaChart, Building, DollarSign, Banknote, Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Toaster, toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParkingLotsPage() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null);

  // Fetch Data
  const fetchLots = useCallback(async (term: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchParkingLots(term);
      setParkingLots(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load parking lots",
      );
      setParkingLots([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLots(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchLots]);

  const refreshData = () => fetchLots(debouncedSearchTerm);

  // --- Handlers ---
  const handleAddSubmit = async (
    formData: Omit<AddParkingLotPayload, "ownerId">,
  ) => {
    const ownerId = 1; // Assuming fixed owner ID
    setIsLoading(true); // Indicate loading during submit
    try {
      await addParkingLot({ ...formData, ownerId });
      toast.success("Bãi đỗ xe đã được thêm thành công");
      setIsAddModalOpen(false);
      refreshData();
    } catch (err) {
      toast.error(`Lỗi: ${err instanceof Error ? err.message : "Không thể thêm bãi đỗ xe"}`);
      setIsLoading(false);
    }
  };

  const handleEditClick = (lot: ParkingLot) => {
    setEditingLot(lot);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (
    formData: Omit<UpdateParkingLotPayload, "parkingLotId">,
  ) => {
    if (!editingLot) {
      console.error("Error: editingLot is null in handleUpdateSubmit");
      return;
    }

    setIsLoading(true);
    try {
      const payload: UpdateParkingLotPayload = {
        ...formData,
        parkingLotId: editingLot.parkingLotId,
      };
      await updateParkingLot(payload);
      toast.success("Bãi đỗ xe đã được cập nhật thành công");
      setIsEditModalOpen(false);
      setEditingLot(null);
      refreshData();
    } catch (err) {
      toast.error(`Lỗi: ${err instanceof Error ? err.message : "Không thể cập nhật bãi đỗ xe"}`);
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bãi đỗ xe này? Hành động này không thể hoàn tác.")) {
      setIsLoading(true);
      try {
        await deleteParkingLot(id);
        toast.success("Bãi đỗ xe đã được xóa thành công");
        refreshData();
      } catch (err) {
        toast.error(`Lỗi: ${err instanceof Error ? err.message : "Không thể xóa bãi đỗ xe"}`);
        setIsLoading(false);
      }
    }
  };

  // Calculate statistics
  const totalLots = parkingLots.length;
  const averagePricePerHour = parkingLots.length
    ? parkingLots.reduce((sum, lot) => sum + (lot.pricePerHour || 0), 0) / parkingLots.length
    : 0;
  const averagePricePerDay = parkingLots.length
    ? parkingLots.reduce((sum, lot) => sum + (lot.pricePerDay || 0), 0) / parkingLots.length
    : 0;
  const averagePricePerMonth = parkingLots.length
    ? parkingLots.reduce((sum, lot) => sum + (lot.pricePerMonth || 0), 0) / parkingLots.length
    : 0;

  return (
    <>
      <Toaster />
      <div className="container mx-auto py-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/dashboard" },
              { label: "Quản lý bãi đỗ xe" }
            ]}
          />
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Quản lý bãi đỗ xe</h1>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm bãi đỗ xe
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm bãi đỗ xe mới</DialogTitle>
                  <DialogDescription>
                    Thêm thông tin bãi đỗ xe mới vào hệ thống
                  </DialogDescription>
                </DialogHeader>
                <ParkingLotForm
                  onSubmitAction={handleAddSubmit}
                  onCancelAction={() => setIsAddModalOpen(false)}
                  key="add-lot"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Tổng số bãi đỗ xe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Car className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{totalLots}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Giá trung bình theo giờ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Banknote className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{averagePricePerHour.toLocaleString('vi-VN')} ₫</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Giá trung bình theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Banknote className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{averagePricePerDay.toLocaleString('vi-VN')} ₫</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Giá trung bình theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Banknote className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{averagePricePerMonth.toLocaleString('vi-VN')} ₫</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 pr-4 w-full"
            />
          </div>
        </div>

        {/* Data Display Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Không thể tải dữ liệu</h3>
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fetchLots(debouncedSearchTerm)}
              >
                Thử lại
              </Button>
            </div>
          )}

          {!isLoading && !error && parkingLots.length === 0 && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Car className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Không tìm thấy bãi đỗ xe nào</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? `Không tìm thấy bãi đỗ xe nào phù hợp với từ khóa "${searchTerm}"` : "Chưa có bãi đỗ xe nào trong hệ thống. Hãy tạo bãi đỗ xe đầu tiên!"}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4 mr-2"
                  onClick={() => setSearchTerm("")}
                >
                  Xóa bộ lọc
                </Button>
              )}
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <PlusCircle className="w-4 h-4 mr-2" /> Thêm bãi đỗ xe
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}

          {!isLoading && !error && parkingLots.length > 0 && (
            <ParkingLotsTable
              lots={parkingLots}
              onEditAction={handleEditClick}
              onDeleteAction={handleDeleteClick}
            />
          )}
        </div>

        {/* Edit Modal */}
        <Dialog
          open={isEditModalOpen}
          onOpenChange={(open) => {
            if (!open) setEditingLot(null);
            setIsEditModalOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin bãi đỗ xe</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin chi tiết của bãi đỗ xe
              </DialogDescription>
            </DialogHeader>
            {editingLot && (
              <ParkingLotForm
                onSubmitAction={handleUpdateSubmit}
                initialData={editingLot}
                onCancelAction={() => {
                  setIsEditModalOpen(false);
                  setEditingLot(null);
                }}
                key={`edit-lot-${editingLot.parkingLotId}`}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
