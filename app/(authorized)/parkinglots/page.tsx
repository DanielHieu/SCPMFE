// app/(authorized)/parking-lots/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  searchParkingLots,
  addParkingLot,
  updateParkingLot
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
import { Search, Car, Banknote, Plus } from "lucide-react";
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
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/dashboard" },
            { label: "Quản lý bãi đỗ xe" }
          ]}
        />

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

        {/* Unified container with white background */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* Header section with Add Button */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý bãi đỗ xe
            </h1>
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

          {/* Search section */}
          <div className="px-6 pt-4 pb-2 border-b border-gray-200">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bãi đỗ xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-9 pr-4 w-full"
              />
            </div>
          </div>

          {/* Table area */}
          <div className="pb-0">
            {isLoading && (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2 text-gray-500">Đang tải dữ liệu bãi đỗ xe...</p>
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
              <ParkingLotsTable
                lots={parkingLots}
                onEditAction={handleEditClick}
              />
            )}
          </div>
        </div>

        {/* Edit dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa bãi đỗ xe</DialogTitle>
              <DialogDescription>
                Thay đổi thông tin bãi đỗ xe
              </DialogDescription>
            </DialogHeader>
            {editingLot && (
              <ParkingLotForm
                initialData={editingLot}
                onSubmitAction={handleUpdateSubmit}
                onCancelAction={() => setIsEditModalOpen(false)}
                key={`edit-lot-${editingLot.parkingLotId}`}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
