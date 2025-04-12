// app/(authorized)/parkinglots/[lotId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { toast } from "sonner";

// Import UI Components
import {
  Breadcrumb,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  MapPin,
  Calendar,
  Building,
  Info,
  Car,
  Edit,
  Save,
  AreaChart,
  X,
  AlertTriangle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import Components
import { MapDisplay } from "@/components/parkinglots/MapDisplay";

// Import API functions
import { getParkingLotById, getAreasByLot, getFloorsByArea, getParkingSpacesByFloor, addArea, addFloor, addSpace, updateParkingLot } from "@/lib/api";
import { Area, Floor, ParkingSpace, RentalType, ParkingSpaceStatus } from "@/types";

export default function ParkingLotDetailPage() {
  const params = useParams();
  const lotId = parseInt(params?.lotId as string, 10);

  const [lotData, setLotData] = useState<any>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Trạng thái cho chỉnh sửa bãi đỗ xe
  const [editData, setEditData] = useState({
    address: "",
    pricePerHour: 0,
    pricePerDay: 0,
    pricePerMonth: 0,
    lat: 0,
    long: 0
  });

  // States for parking spaces management
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [areasList, setAreasList] = useState<Area[]>([]);
  const [floorsList, setFloorsList] = useState<Floor[]>([]);
  const [spacesList, setSpacesList] = useState<ParkingSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [isAddAreaDialogOpen, setIsAddAreaDialogOpen] = useState(false);
  const [isAddFloorDialogOpen, setIsAddFloorDialogOpen] = useState(false);
  const [isAddSpaceDialogOpen, setIsAddSpaceDialogOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaRentalType, setNewAreaRentalType] = useState<RentalType>(RentalType.Walkin);
  const [newFloorName, setNewFloorName] = useState("");
  const [newSpaceName, setNewSpaceName] = useState("");

  // Stats for the overview panel
  const [stats, setStats] = useState({
    totalAreas: 0,
    totalFloors: 0,
    totalSpaces: 0,
    occupiedSpaces: 0
  });

  // Helper function to get styles for parking spaces based on status
  const getSpaceStyles = (status: ParkingSpaceStatus | number | string, isSelected: boolean) => {
    const baseStyles = "relative p-3 text-center font-medium rounded-lg transition-all duration-300 border";

    // Xử lý trường hợp status là số
    const getStatusFromNumber = (numStatus: number): ParkingSpaceStatus => {
      switch (numStatus) {
        case 0: return ParkingSpaceStatus.Disabled;
        case 1: return ParkingSpaceStatus.Available;
        case 2: return ParkingSpaceStatus.Occupied;
        case 3: return ParkingSpaceStatus.Reserved;
        case 4: return ParkingSpaceStatus.Pending;
        default: return ParkingSpaceStatus.Disabled;
      }
    };

    // Xử lý trường hợp status là chuỗi
    const getStatusFromString = (strStatus: string): ParkingSpaceStatus => {
      // Kiểm tra xem chuỗi có phải là một giá trị hợp lệ của enum không
      if (Object.values(ParkingSpaceStatus).includes(strStatus as ParkingSpaceStatus)) {
        return strStatus as ParkingSpaceStatus;
      }

      // Nếu không phải, thử chuyển đổi từ số (trong chuỗi) sang enum
      const numStatus = parseInt(strStatus, 10);
      if (!isNaN(numStatus)) {
        return getStatusFromNumber(numStatus);
      }

      // Mặc định trả về Available nếu không xác định được
      return ParkingSpaceStatus.Available;
    };

    // Đảm bảo status là enum ParkingSpaceStatus
    let spaceStatus: ParkingSpaceStatus;
    if (typeof status === 'number') {
      spaceStatus = getStatusFromNumber(status);
    } else if (typeof status === 'string') {
      spaceStatus = getStatusFromString(status);
    } else {
      spaceStatus = status;
    }

    const statusStyles = (s: ParkingSpaceStatus) => {
      switch (s) {
        case ParkingSpaceStatus.Available:
          return "bg-green-50 border-green-200 text-green-800 hover:bg-green-100 cursor-pointer";
        case ParkingSpaceStatus.Occupied:
          return "bg-red-50 border-red-200 text-red-800 cursor-not-allowed";
        case ParkingSpaceStatus.Reserved:
          return "bg-yellow-50 border-yellow-200 text-yellow-800 cursor-not-allowed";
        case ParkingSpaceStatus.Pending:
          return "bg-purple-50 border-purple-200 text-purple-800 cursor-not-allowed";
        case ParkingSpaceStatus.Disabled:
          return "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed";
        default:
          return "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed";
      }
    };

    const statusStyle = statusStyles(spaceStatus);
    const selectedStyle = isSelected ? 'ring-2 ring-blue-500 transform scale-105 shadow-md' : '';

    return `${baseStyles} ${statusStyle} ${selectedStyle}`;
  };

  // Helper function to get status text
  const getStatusText = (status: ParkingSpaceStatus | number | string) => {
    // Xử lý trường hợp status là số
    const getStatusFromNumber = (numStatus: number): ParkingSpaceStatus => {
      switch (numStatus) {
        case 0: return ParkingSpaceStatus.Disabled;
        case 1: return ParkingSpaceStatus.Available;
        case 2: return ParkingSpaceStatus.Occupied;
        case 3: return ParkingSpaceStatus.Reserved;
        case 4: return ParkingSpaceStatus.Pending;
        default: return ParkingSpaceStatus.Disabled;
      }
    };

    // Xử lý trường hợp status là chuỗi
    const getStatusFromString = (strStatus: string): ParkingSpaceStatus => {
      // Kiểm tra xem chuỗi có phải là một giá trị hợp lệ của enum không
      if (Object.values(ParkingSpaceStatus).includes(strStatus as ParkingSpaceStatus)) {
        return strStatus as ParkingSpaceStatus;
      }

      // Nếu không phải, thử chuyển đổi từ số (trong chuỗi) sang enum
      const numStatus = parseInt(strStatus, 10);
      if (!isNaN(numStatus)) {
        return getStatusFromNumber(numStatus);
      }

      // Mặc định trả về Available nếu không xác định được
      return ParkingSpaceStatus.Available;
    };

    // Đảm bảo status là enum ParkingSpaceStatus
    let spaceStatus: ParkingSpaceStatus;
    if (typeof status === 'number') {
      spaceStatus = getStatusFromNumber(status);
    } else if (typeof status === 'string') {
      spaceStatus = getStatusFromString(status);
    } else {
      spaceStatus = status;
    }

    switch (spaceStatus) {
      case ParkingSpaceStatus.Available:
        return "Trống";
      case ParkingSpaceStatus.Occupied:
        return "Đã đỗ";
      case ParkingSpaceStatus.Reserved:
        return "Đã đặt";
      case ParkingSpaceStatus.Pending:
        return "Xe đang vào/ra";
      case ParkingSpaceStatus.Disabled:
        return "Vô hiệu";
      default:
        return "Không xác định";
    }
  };

  // Helper function to get status badge style
  const getStatusBadgeStyle = (status: ParkingSpaceStatus | number | string) => {
    const baseStyle = "text-xs px-2 py-0.5 rounded-full";

    // Xử lý trường hợp status là số
    const getStatusFromNumber = (numStatus: number): ParkingSpaceStatus => {
      switch (numStatus) {
        case 0: return ParkingSpaceStatus.Disabled;
        case 1: return ParkingSpaceStatus.Available;
        case 2: return ParkingSpaceStatus.Occupied;
        case 3: return ParkingSpaceStatus.Reserved;
        case 4: return ParkingSpaceStatus.Pending;
        default: return ParkingSpaceStatus.Disabled;
      }
    };

    // Xử lý trường hợp status là chuỗi
    const getStatusFromString = (strStatus: string): ParkingSpaceStatus => {
      // Kiểm tra xem chuỗi có phải là một giá trị hợp lệ của enum không
      if (Object.values(ParkingSpaceStatus).includes(strStatus as ParkingSpaceStatus)) {
        return strStatus as ParkingSpaceStatus;
      }

      // Nếu không phải, thử chuyển đổi từ số (trong chuỗi) sang enum
      const numStatus = parseInt(strStatus, 10);
      if (!isNaN(numStatus)) {
        return getStatusFromNumber(numStatus);
      }

      // Mặc định trả về Available nếu không xác định được
      return ParkingSpaceStatus.Available;
    };

    // Đảm bảo status là enum ParkingSpaceStatus
    let spaceStatus: ParkingSpaceStatus;
    if (typeof status === 'number') {
      spaceStatus = getStatusFromNumber(status);
    } else if (typeof status === 'string') {
      spaceStatus = getStatusFromString(status);
    } else {
      spaceStatus = status;
    }

    switch (spaceStatus) {
      case ParkingSpaceStatus.Available:
        return `${baseStyle} bg-green-100 text-green-800`;
      case ParkingSpaceStatus.Occupied:
        return `${baseStyle} bg-red-100 text-red-800`;
      case ParkingSpaceStatus.Reserved:
        return `${baseStyle} bg-yellow-100 text-yellow-800`;
      case ParkingSpaceStatus.Pending:
        return `${baseStyle} bg-purple-100 text-purple-800`;
      case ParkingSpaceStatus.Disabled:
        return `${baseStyle} bg-gray-100 text-gray-800`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  useEffect(() => {
    if (isNaN(lotId)) {
      console.error(`[ParkingLotDetail] Invalid lot ID: ${params?.lotId}`);
      notFound(); // Invalid lot ID format
      return;
    }

    // Fetch parking lot data
    const fetchData = async () => {
      console.log(`[ParkingLotDetail] Fetching data for lot ID: ${lotId}`);
      setIsLoading(true);
      setError(null);

      try {
        // Get parking lot details
        console.log(`[ParkingLotDetail] Fetching lot details...`);
        const lotDetails = await getParkingLotById(lotId);
        console.log(`[ParkingLotDetail] Lot details received:`, lotDetails);
        setLotData(lotDetails);

        // Initialize edit data
        setEditData({
          address: lotDetails?.address || "",
          pricePerHour: lotDetails?.pricePerHour || 0,
          pricePerDay: lotDetails?.pricePerDay || 0,
          pricePerMonth: lotDetails?.pricePerMonth || 0,
          lat: lotDetails?.lat || 0,
          long: lotDetails?.long || 0
        });

        // Get areas for this parking lot
        console.log(`[ParkingLotDetail] Fetching areas for lot ID: ${lotId}`);
        const areasData = await getAreasByLot(lotId);
        console.log(`[ParkingLotDetail] Areas received:`, areasData?.length || 0);
        setAreas(Array.isArray(areasData) ? areasData : []);

        // Calculate statistics
        let floors = 0;
        let spaces = 0;
        let occupied = 0;

        if (Array.isArray(areasData)) {
          // Calculate stats based on available data
          setStats({
            totalAreas: areasData.length,
            totalFloors: floors,
            totalSpaces: spaces,
            occupiedSpaces: occupied
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error(`[ParkingLotDetail] Error fetching data:`, errorMessage);
        setError("Failed to load parking lot data");
        toast.error("Không thể tải dữ liệu bãi đỗ xe", {
          description: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lotId, params?.lotId]);

  // Handle saving edited lot data
  const handleSaveLotData = async () => {
    console.log(`[ParkingLotDetail] Saving lot data for ID: ${lotId}`, editData);
    try {
      const payload = {
        parkingLotId: lotId,
        ...editData
      };

      await updateParkingLot(payload);
      console.log(`[ParkingLotDetail] Lot data updated successfully for ID: ${lotId}`);

      // Update local state
      setLotData({
        ...lotData,
        ...editData
      });

      setIsEditModalOpen(false);
      toast.success("Đã cập nhật thông tin bãi đỗ xe");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[ParkingLotDetail] Error updating lot data:`, errorMessage);
      toast.error("Lỗi khi cập nhật thông tin bãi đỗ xe", {
        description: errorMessage
      });
    }
  };

  // Load areas, floors and spaces
  const loadAreas = async () => {
    console.log(`[ParkingLotDetail] Loading areas for lot ID: ${lotId}`);
    try {
      const areasData = await getAreasByLot(lotId);
      console.log(`[ParkingLotDetail] Areas loaded:`, areasData?.length || 0);
      setAreasList(Array.isArray(areasData) ? areasData : []);
      // Calculate statistics
      let totalFloors = 0;
      let totalSpaces = 0;

      if (Array.isArray(areasData) && areasData.length > 0) {
        // For statistics, we could load all floors and spaces
        // But for performance, we'll only update the counts when specific areas/floors are loaded
        setStats({
          totalAreas: areasData.length,
          totalFloors,
          totalSpaces,
          occupiedSpaces: 0
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[ParkingLotDetail] Error loading areas:`, errorMessage);
      toast.error("Không thể tải dữ liệu khu vực");
    }
  };

  const loadFloors = async (areaId: number) => {
    if (!areaId) return;

    console.log(`[ParkingLotDetail] Loading floors for area ID: ${areaId}`);
    try {
      const floorsData = await getFloorsByArea(areaId);
      console.log(`[ParkingLotDetail] Floors loaded:`, floorsData?.length || 0);
      setFloorsList(Array.isArray(floorsData) ? floorsData : []);
      setSelectedFloor(null);
      setSpacesList([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[ParkingLotDetail] Error loading floors:`, errorMessage);
      toast.error("Không thể tải dữ liệu tầng");
    }
  };

  const loadSpaces = async (floorId: number) => {
    if (!floorId) return;

    console.log(`[ParkingLotDetail] Loading spaces for floor ID: ${floorId}`);
    try {
      const spacesData = await getParkingSpacesByFloor(floorId);
      console.log(`[ParkingLotDetail] Spaces loaded:`, spacesData?.length || 0);
      setSpacesList(Array.isArray(spacesData) ? spacesData : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[ParkingLotDetail] Error loading spaces:`, errorMessage);
      toast.error("Không thể tải dữ liệu vị trí đỗ xe");
    }
  };

  // Handle area selection
  const handleAreaChange = (areaId: number) => {
    console.log(`[ParkingLotDetail] Area selected: ${areaId}`);
    setSelectedArea(areaId);
    loadFloors(areaId);
  };

  // Handle floor selection
  const handleFloorChange = (floorId: number) => {
    console.log(`[ParkingLotDetail] Floor selected: ${floorId}`);
    setSelectedFloor(floorId);
    loadSpaces(floorId);
  };

  // Handle space selection
  const handleSpaceSelection = (spaceId: number) => {
    console.log(`[ParkingLotDetail] Space selected: ${spaceId}`);
    setSelectedSpace(spaceId === selectedSpace ? null : spaceId);
  };

  // Add new area
  const handleAddArea = async () => {
    if (!newAreaName.trim()) {
      toast.error("Vui lòng nhập tên khu vực");
      return;
    }

    console.log(`[ParkingLotDetail] Adding new area: ${newAreaName} with rental type: ${newAreaRentalType}`);
    try {
      await addArea({
        parkingLotId: lotId,
        areaName: newAreaName,
        rentalType: newAreaRentalType
      });

      console.log(`[ParkingLotDetail] Area added successfully: ${newAreaName}`);
      toast.success("Đã thêm khu vực mới");
      resetAreaForm();
      loadAreas();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[ParkingLotDetail] Error adding area:`, errorMessage);
      toast.error("Không thể thêm khu vực");
    }
  };

  // Add new floor
  const handleAddFloor = async () => {
    if (!selectedArea) {
      toast.error("Vui lòng chọn khu vực trước");
      return;
    }

    if (!newFloorName.trim()) {
      toast.error("Vui lòng nhập tên tầng");
      return;
    }

    console.log(`[ParkingLotDetail] Adding new floor: ${newFloorName} to area: ${selectedArea}`);
    try {
      await addFloor({
        areaId: selectedArea,
        floorName: newFloorName
      });

      console.log(`[ParkingLotDetail] Floor added successfully: ${newFloorName}`);
      toast.success("Đã thêm tầng mới");
      resetFloorForm();
      loadFloors(selectedArea);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[ParkingLotDetail] Error adding floor:`, errorMessage);
      toast.error("Không thể thêm tầng");
    }
  };

  // Add new parking space
  const handleAddSpace = async () => {
    if (!selectedFloor) {
      toast.error("Vui lòng chọn tầng trước");
      return;
    }

    if (!newSpaceName.trim()) {
      toast.error("Vui lòng nhập tên vị trí đỗ xe");
      return;
    }

    console.log(`[ParkingLotDetail] Adding new space: ${newSpaceName} to floor: ${selectedFloor}`);
    try {
      // Chỉ truyền các thuộc tính mà API chấp nhận
      await addSpace({
        floorId: selectedFloor,
        parkingSpaceName: newSpaceName
        // Status không được truyền, sẽ mặc định là Available từ phía server
      });

      console.log(`[ParkingLotDetail] Space added successfully: ${newSpaceName}`);
      toast.success("Đã thêm vị trí đỗ xe mới");
      resetSpaceForm();
      loadSpaces(selectedFloor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[ParkingLotDetail] Error adding space:`, errorMessage);
      toast.error("Không thể thêm vị trí đỗ xe");
    }
  };

  // Reset form helpers
  const resetAreaForm = () => {
    setNewAreaName("");
    setNewAreaRentalType(RentalType.Walkin);
    setIsAddAreaDialogOpen(false);
  };

  const resetFloorForm = () => {
    setNewFloorName("");
    setIsAddFloorDialogOpen(false);
  };

  const resetSpaceForm = () => {
    setNewSpaceName("");
    setIsAddSpaceDialogOpen(false);
  };

  // Load areas when tab changes to parking-spaces
  useEffect(() => {
    if (activeTab === "parking-spaces") {
      console.log(`[ParkingLotDetail] Tab changed to parking-spaces, loading areas`);
      loadAreas();
    }
  }, [activeTab, lotId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải dữ liệu bãi đỗ xe...</p>
      </div>
    );
  }

  if (error || !lotData) {
    return (
      <div className="container mx-auto py-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Lỗi</h3>
          </div>
          <p>{error || "Không tìm thấy dữ liệu bãi đỗ xe"}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Quản lý bãi đỗ xe", href: "/parkinglots" },
          { label: lotData.address || `Bãi đỗ xe ${lotId}` }
        ]}
      />

      {/* Header with basic info and actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {lotData.address || `Bãi đỗ xe ${lotId}`}
            </h1>
            <div className="flex items-center text-gray-500 mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {lotData.address || "Chưa cập nhật địa chỉ"}
                {lotData.lat && lotData.long ? ` (${lotData.lat.toFixed(6)}, ${lotData.long.toFixed(6)})` : ""}
              </span>
            </div>
            <div className="flex items-center text-gray-500 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Ngày tạo: {new Date(lotData.createdDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center border px-2.5 py-1 rounded-full bg-blue-50 border-blue-200">
                <span className="text-xl mr-1 text-blue-600">₫</span>
                <span className="text-sm font-medium text-blue-700">
                  {lotData.pricePerHour.toLocaleString('vi-VN')}đ/giờ
                </span>
              </div>
              <div className="flex items-center border px-2.5 py-1 rounded-full bg-green-50 border-green-200">
                <span className="text-xl mr-1 text-green-600">₫</span>
                <span className="text-sm font-medium text-green-700">
                  {lotData.pricePerDay.toLocaleString('vi-VN')}đ/ngày
                </span>
              </div>
              <div className="flex items-center border px-2.5 py-1 rounded-full bg-purple-50 border-purple-200">
                <span className="text-xl mr-1 text-purple-600">₫</span>
                <span className="text-sm font-medium text-purple-700">
                  {lotData.pricePerMonth.toLocaleString('vi-VN')}đ/tháng
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex gap-2 items-center">
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa thông tin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa thông tin bãi đỗ xe</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="address" className="text-sm font-medium">Địa chỉ</label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      placeholder="Nhập địa chỉ bãi đỗ xe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="lat" className="text-sm font-medium">Vĩ độ</label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.000001"
                        value={editData.lat}
                        onChange={(e) => setEditData({ ...editData, lat: parseFloat(e.target.value) })}
                        placeholder="Vĩ độ"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="long" className="text-sm font-medium">Kinh độ</label>
                      <Input
                        id="long"
                        type="number"
                        step="0.000001"
                        value={editData.long}
                        onChange={(e) => setEditData({ ...editData, long: parseFloat(e.target.value) })}
                        placeholder="Kinh độ"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="pricePerHour" className="text-sm font-medium">Giá theo giờ (đ)</label>
                    <Input
                      id="pricePerHour"
                      type="number"
                      value={editData.pricePerHour}
                      onChange={(e) => setEditData({ ...editData, pricePerHour: parseInt(e.target.value) })}
                      placeholder="Giá theo giờ"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="pricePerDay" className="text-sm font-medium">Giá theo ngày (đ)</label>
                    <Input
                      id="pricePerDay"
                      type="number"
                      value={editData.pricePerDay}
                      onChange={(e) => setEditData({ ...editData, pricePerDay: parseInt(e.target.value) })}
                      placeholder="Giá theo ngày"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="pricePerMonth" className="text-sm font-medium">Giá theo tháng (đ)</label>
                    <Input
                      id="pricePerMonth"
                      type="number"
                      value={editData.pricePerMonth}
                      onChange={(e) => setEditData({ ...editData, pricePerMonth: parseInt(e.target.value) })}
                      placeholder="Giá theo tháng"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSaveLotData}
                    className="flex gap-2 items-center"
                  >
                    <Save className="h-4 w-4" />
                    Lưu thông tin
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button className="flex gap-2 items-center">
              <PlusCircle className="h-4 w-4" />
              Thêm khu vực
            </Button>
          </div>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Info className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value="parking-spaces"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Car className="h-4 w-4" />
            Vị trí đỗ xe
          </TabsTrigger>
        </TabsList>

        {/* Overview tab content */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Tổng số khu vực</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AreaChart className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{stats.totalAreas}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Tổng số tầng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-2xl font-bold">{stats.totalFloors}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Vị trí đỗ xe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">{stats.totalSpaces}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Giá theo giờ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-xl mr-2 text-yellow-500">₫</span>
                  <span className="text-2xl font-bold">{lotData.pricePerHour.toLocaleString('vi-VN')} đ</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vị trí bãi đỗ xe</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] relative">
                <div className="h-full w-full overflow-hidden rounded-md">
                  <MapDisplay
                    lat={lotData.lat ?? 0}
                    long={lotData.long ?? 0}
                    address={lotData.address}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Parking spaces tab content */}
        <TabsContent value="parking-spaces">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý vị trí đỗ xe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Areas section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Khu vực</h3>
                    <Dialog open={isAddAreaDialogOpen} onOpenChange={setIsAddAreaDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Thêm khu vực
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Thêm khu vực mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="areaName">Tên khu vực</Label>
                            <Input
                              id="areaName"
                              value={newAreaName}
                              onChange={(e) => setNewAreaName(e.target.value)}
                              placeholder="Nhập tên khu vực"
                              className="focus-visible:ring-blue-500"
                              autoFocus
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="rentalType">Loại cho thuê</Label>
                            <Select
                              value={newAreaRentalType}
                              onValueChange={(value) => setNewAreaRentalType(value as RentalType)}
                            >
                              <SelectTrigger id="rentalType" className="focus-visible:ring-blue-500">
                                <SelectValue placeholder="Chọn loại cho thuê" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={RentalType.Walkin}>Vãng lai</SelectItem>
                                <SelectItem value={RentalType.Contract}>Hợp đồng</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button variant="outline" onClick={resetAreaForm}>Hủy</Button>
                          <Button onClick={handleAddArea} className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Thêm khu vực
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {areasList.map((area) => (
                      <div
                        key={area.areaId}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedArea === area.areaId ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                          }`}
                        onClick={() => handleAreaChange(area.areaId)}
                      >
                        <h4 className="font-medium">{area.areaName}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-gray-500">{area.totalFloors} tầng</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {area.rentalType === RentalType.Walkin ? 'Vãng lai' : 'Hợp đồng'}
                          </span>
                        </div>
                      </div>
                    ))}

                    {areasList.length === 0 && (
                      <div className="col-span-full text-center p-6 border rounded-lg bg-gray-50">
                        <p className="text-gray-500">Chưa có khu vực nào</p>
                        <Dialog open={isAddAreaDialogOpen} onOpenChange={setIsAddAreaDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              Thêm khu vực
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>

                {/* Floors section - only shown when an area is selected */}
                {selectedArea && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Tầng</h3>
                      <Dialog open={isAddFloorDialogOpen} onOpenChange={setIsAddFloorDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Thêm tầng
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Thêm tầng mới</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="floorName">Tên tầng</Label>
                              <Input
                                id="floorName"
                                value={newFloorName}
                                onChange={(e) => setNewFloorName(e.target.value)}
                                placeholder="Nhập tên tầng"
                                className="focus-visible:ring-blue-500"
                                autoFocus
                              />
                            </div>
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                              <p className="text-sm text-blue-700">
                                Tầng sẽ được thêm vào khu vực đã chọn.
                              </p>
                            </div>
                          </div>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={resetFloorForm}>Hủy</Button>
                            <Button onClick={handleAddFloor} className="gap-2">
                              <PlusCircle className="h-4 w-4" />
                              Thêm tầng
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {floorsList.map((floor) => (
                        <div
                          key={floor.floorId}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedFloor === floor.floorId ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                            }`}
                          onClick={() => handleFloorChange(floor.floorId)}
                        >
                          <h4 className="font-medium">{floor.floorName}</h4>
                          <p className="text-sm text-gray-500">{floor.totalParkingSpaces} vị trí</p>
                        </div>
                      ))}

                      {floorsList.length === 0 && (
                        <div className="col-span-full text-center p-6 border rounded-lg bg-gray-50">
                          <p className="text-gray-500">Chưa có tầng nào trong khu vực này</p>
                          <Dialog open={isAddFloorDialogOpen} onOpenChange={setIsAddFloorDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Thêm tầng
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Parking spaces section - only shown when a floor is selected */}
                {selectedFloor && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Vị trí đỗ xe</h3>
                      <Dialog open={isAddSpaceDialogOpen} onOpenChange={setIsAddSpaceDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Thêm vị trí đỗ xe
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Thêm vị trí đỗ xe mới</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="spaceName">Tên vị trí</Label>
                              <Input
                                id="spaceName"
                                value={newSpaceName}
                                onChange={(e) => setNewSpaceName(e.target.value)}
                                placeholder="Nhập tên vị trí đỗ xe"
                                className="focus-visible:ring-blue-500"
                                autoFocus
                              />
                            </div>
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                              <p className="text-sm text-blue-700">
                                Vị trí đỗ xe sẽ được thêm vào tầng đã chọn. Trạng thái mặc định của vị trí là "Trống".
                              </p>
                            </div>
                          </div>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={resetSpaceForm}>Hủy</Button>
                            <Button onClick={handleAddSpace} className="gap-2">
                              <PlusCircle className="h-4 w-4" />
                              Thêm vị trí đỗ xe
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {spacesList.map((space) => (
                        <div
                          key={space.parkingSpaceId}
                          className={getSpaceStyles(space.status, selectedSpace === space.parkingSpaceId)}
                          onClick={() => handleSpaceSelection(space.parkingSpaceId)}
                        >
                          <h4 className="font-medium">{space.parkingSpaceName}</h4>
                          <div className="flex justify-between mt-1">
                            <span className={getStatusBadgeStyle(space.status)}>
                              {getStatusText(space.status)}
                            </span>
                            <button className="text-gray-500 hover:text-blue-500">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {spacesList.length === 0 && (
                        <div className="col-span-full text-center p-6 border rounded-lg bg-gray-50">
                          <p className="text-gray-500">Chưa có vị trí đỗ xe nào trong tầng này</p>
                          <Dialog open={isAddSpaceDialogOpen} onOpenChange={setIsAddSpaceDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Thêm vị trí đỗ xe
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
