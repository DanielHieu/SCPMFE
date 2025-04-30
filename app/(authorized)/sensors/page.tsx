"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    PlusCircle,
    Search,
    RefreshCw,
    AlertCircle,
    Edit,
    Trash2,
    Copy,
    Eye,
    EyeOff
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getParkingStatusSensors } from "@/lib/api/parking-space.api";
import { ParkingStatusSensor } from "@/types/parkingStatusSensor";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/lib/api/api-helper";
import { Area, Floor, ParkingLot, ParkingSpace } from "@/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useDebounce from "@/hooks/useDebounce";

// Mở rộng kiểu dữ liệu cho nhu cầu giao diện
type SensorWithUI = ParkingStatusSensor & {
    showApiKey?: boolean;
    lastMaintenance?: string;
    batteryLevel?: number;
};

type FilterStatus = "all" | "active" | "inactive" | "maintenance";

export default function SensorsPage() {
    const [sensors, setSensors] = useState<SensorWithUI[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSensor, setEditingSensor] = useState<SensorWithUI | null>(null);
    const [newSensor, setNewSensor] = useState<Partial<SensorWithUI>>({});
    const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
    const [counts, setCounts] = useState({
        all: 0,
        active: 0,
        inactive: 0,
        maintenance: 0,
    });

    // Trạng thái cho lựa chọn phân cấp
    const [parkingLots, setParkingLots] = useState<Array<ParkingLot>>([]);
    const [areas, setAreas] = useState<Array<Area>>([]);
    const [floors, setFloors] = useState<Array<Floor>>([]);
    const [parkingSpaces, setParkingSpaces] = useState<Array<ParkingSpace>>([]);

    // Giá trị đã chọn cho lựa chọn phân cấp
    const [selectedLot, setSelectedLot] = useState<number | null>(null);
    const [selectedArea, setSelectedArea] = useState<number | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Tạo API key ngẫu nhiên
    const generateApiKey = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const length = 32;
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    };

    // Sao chép API key vào clipboard
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("API key đã được sao chép");
        } catch (err) {
            toast.error("Không thể sao chép API key");
        }
    };

    // Bật/tắt hiển thị API key
    const toggleShowApiKey = (sensorId: number) => {
        setShowApiKey(prev => ({
            ...prev,
            [sensorId]: !prev[sensorId]
        }));
    };

    // Lấy dữ liệu cảm biến từ API
    const fetchSensors = useCallback(async (term?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getParkingStatusSensors();

            // Kiểm tra xem data có phải là mảng không
            if (!Array.isArray(data)) {
                throw new Error("Dữ liệu không hợp lệ từ API");
            }

            // Ánh xạ dữ liệu API sang dữ liệu giao diện
            const mappedSensors = data.map(sensor => ({
                ...sensor,
                // Thêm thuộc tính dành riêng cho giao diện với giá trị mặc định
                showApiKey: false,
                lastMaintenance: new Date().toISOString().split('T')[0], // Mặc định là hôm nay
                batteryLevel: Math.floor(Math.random() * 100), // Mức pin giả lập
                location: `Bãi đỗ xe - Vị trí ${sensor.parkingSpaceName}` // Tạo vị trí
            }));

            setSensors(mappedSensors);

            // Cập nhật số lượng
            const allCount = mappedSensors.length;
            const activeCount = mappedSensors.filter(s => s.status?.toLowerCase() === "active").length;
            const inactiveCount = mappedSensors.filter(s => s.status?.toLowerCase() === "inactive").length;
            const maintenanceCount = mappedSensors.filter(s => s.status?.toLowerCase() === "maintenance").length;

            setCounts({
                all: allCount,
                active: activeCount,
                inactive: inactiveCount,
                maintenance: maintenanceCount,
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định");
            toast.error("Không thể tải dữ liệu cảm biến");
            // Đặt sensors thành mảng rỗng khi có lỗi
            setSensors([]);
            setCounts({
                all: 0,
                active: 0,
                inactive: 0,
                maintenance: 0,
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect để lấy dữ liệu khi từ khóa tìm kiếm thay đổi
    useEffect(() => {
        fetchSensors(debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchSensors]);

    // Ánh xạ trạng thái từ API sang bộ lọc giao diện
    const mapStatusToFilter = (status: string): FilterStatus => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === "active") return "active";
        if (lowerStatus === "inactive") return "inactive";
        if (lowerStatus === "maintenance") return "maintenance";
        return "all";
    };

    // Lọc cảm biến dựa trên trạng thái
    const filteredSensors = useMemo(() => {
        if (filterStatus === "active") {
            return sensors.filter((s) => s.status.toLowerCase() === "active");
        }
        if (filterStatus === "inactive") {
            return sensors.filter((s) => s.status.toLowerCase() === "inactive");
        }
        if (filterStatus === "maintenance") {
            return sensors.filter((s) => s.status.toLowerCase() === "maintenance");
        }
        return sensors;
    }, [sensors, filterStatus]);

    const refreshData = useCallback(() => {
        fetchSensors(debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchSensors]);

    // Xử lý thêm cảm biến mới
    const handleAddSensor = async (sensorData: Partial<SensorWithUI>) => {
        try {
            // Chuẩn bị dữ liệu để gửi đến API
            const payload = {
                apiKey: sensorData.apiKey,
                parkingSpaceId: sensorData.parkingSpaceId,
                status: "active" // Mặc định trạng thái là active khi tạo mới
            };

            // Gọi API để thêm cảm biến
            await fetchApi('/sensor/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            toast.success("Thêm cảm biến thành công");

            // Cập nhật danh sách cảm biến
            refreshData();
            setIsAddModalOpen(false);
            setNewSensor({}); // Đặt lại biểu mẫu
            // Đặt lại lựa chọn phân cấp
            setSelectedLot(null);
            setSelectedArea(null);
            setSelectedFloor(null);
        } catch (err) {
            toast.error("Lỗi: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
        }
    };

    // Xử lý xóa cảm biến
    const handleDeleteSensor = async (sensorId: number) => {
        try {
            // Trong triển khai thực tế, bạn sẽ gọi API để xóa cảm biến
            toast.success("Chức năng chưa được triển khai trong bản demo này");
        } catch (err) {
            toast.error("Lỗi: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
        }
    };

    // Lấy thông tin hiển thị trạng thái
    const getStatusDisplay = (status: string) => {
        const statusLower = status.toLowerCase();

        if (statusLower === "active") {
            return {
                label: "Hoạt động",
                variant: "default",
                className: "bg-green-100 text-green-800"
            };
        }

        if (statusLower === "inactive") {
            return {
                label: "Không hoạt động",
                variant: "outline" as const,
                className: "bg-red-100 text-red-800"
            };
        }

        if (statusLower === "maintenance") {
            return {
                label: "Đang bảo trì",
                variant: "outline" as const,
                className: "bg-yellow-100 text-yellow-800"
            };
        }

        return {
            label: status,
            variant: "outline" as const,
            className: ""
        };
    };

    // Lấy danh sách bãi đỗ xe
    const fetchParkingLots = async () => {
        try {
            // Gọi API để lấy danh sách bãi đỗ xe
            const response = await fetchApi('/parkinglot/getAll');
            setParkingLots(response);
        } catch (err) {
            console.error("Không thể tải dữ liệu bãi đỗ xe:", err);
            toast.error("Không thể tải dữ liệu bãi đỗ xe");
        }
    };

    // Lấy danh sách khu vực dựa trên bãi đỗ xe đã chọn
    const fetchAreas = async (lotId: number) => {
        try {
            // Gọi API để lấy danh sách khu vực
            const response = await fetchApi(`/area/getAreasByParkingLot/?parkingLotId=${lotId}`);
            setAreas(response);
            setSelectedArea(null); // Đặt lại khu vực đã chọn khi bãi đỗ xe thay đổi
            setSelectedFloor(null); // Đặt lại tầng đã chọn
        } catch (err) {
            console.error("Không thể tải dữ liệu khu vực:", err);
            toast.error("Không thể tải dữ liệu khu vực");
        }
    };

    // Lấy danh sách tầng dựa trên khu vực đã chọn
    const fetchFloors = async (areaId: number) => {
        try {
            // Gọi API để lấy danh sách tầng
            const response = await fetchApi(`/floor/GetFloorsByArea/?areaId=${areaId}`);
            setFloors(response);
            setSelectedFloor(null); // Đặt lại tầng đã chọn khi khu vực thay đổi
        } catch (err) {
            console.error("Không thể tải dữ liệu tầng:", err);
            toast.error("Không thể tải dữ liệu tầng");
        }
    };

    // Lấy danh sách vị trí đỗ xe dựa trên tầng đã chọn
    const fetchParkingSpaces = async (floorId: number) => {
        try {
            // Gọi API để lấy danh sách vị trí đỗ xe
            const response = await fetchApi(`/parkingspace/getParkingSpacesByFloor/?floorId=${floorId}`);
            setParkingSpaces(response);
        } catch (err) {
            console.error("Không thể tải dữ liệu vị trí đỗ xe:", err);
            toast.error("Không thể tải dữ liệu vị trí đỗ xe");
        }
    };

    // Effect xử lý khi chọn bãi đỗ xe
    useEffect(() => {
        if (selectedLot) {
            fetchAreas(selectedLot);
        }
    }, [selectedLot]);

    // Effect xử lý khi chọn khu vực
    useEffect(() => {
        if (selectedArea) {
            fetchFloors(selectedArea);
        }
    }, [selectedArea]);

    // Effect xử lý khi chọn tầng
    useEffect(() => {
        if (selectedFloor) {
            fetchParkingSpaces(selectedFloor);
        }
    }, [selectedFloor]);

    // Lấy danh sách vị trí đỗ xe khi mở modal thêm hoặc sửa cảm biến
    useEffect(() => {
        if (isAddModalOpen) {
            fetchParkingLots();
        } else if (isEditModalOpen) {
            fetchParkingLots();
        }
    }, [isAddModalOpen, isEditModalOpen]);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Breadcrumb items={[
                { label: "Trang chủ", href: "/dashboard" },
                { label: "Quản lý cảm biến" },
            ]} />

            {/* Unified container with white background */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {/* Header section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Quản lý cảm biến
                    </h1>
                </div>

                {/* Search section */}
                <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm cảm biến..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 pl-9 pr-4 w-full"
                            />
                        </div>
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Thêm cảm biến
                        </Button>
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
                            <TabsTrigger
                                value="maintenance"
                                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                            >
                                Đang bảo trì ({counts.maintenance})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Table area - no padding to connect directly with tabs */}
                <div className="pb-0">
                    {isLoading && (
                        <div className="p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                            <p className="mt-2 text-gray-500">Đang tải dữ liệu cảm biến...</p>
                        </div>
                    )}
                    {error && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                                <AlertCircle className="text-red-500 h-6 w-6" />
                            </div>
                            <p className="text-red-500">Lỗi: {error}</p>
                            <Button onClick={refreshData} variant="outline" className="mt-4">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Thử lại
                            </Button>
                        </div>
                    )}
                    {!isLoading && !error && filteredSensors.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                <span className="text-gray-500 text-xl">!</span>
                            </div>
                            <p className="text-gray-500">Không tìm thấy cảm biến nào</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {searchTerm ? "Hãy điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc" : "Thêm cảm biến mới để bắt đầu"}
                            </p>
                            {searchTerm && (
                                <Button onClick={() => setSearchTerm("")} variant="outline" className="mt-4">
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    )}
                    {!isLoading && !error && filteredSensors.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tên</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vị trí</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">API Key</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSensors.map((sensor) => {
                                        const statusDisplay = getStatusDisplay(sensor.status);

                                        return (
                                            <tr key={sensor.parkingStatusSensorId} className="border-b hover:bg-muted/50">
                                                <td className="px-4 py-3 text-sm font-medium">{sensor.parkingStatusSensorId}</td>
                                                <td className="px-4 py-3 text-sm">{sensor.name}</td>
                                                <td className="px-4 py-3 text-sm">{sensor.parkingSpaceName}</td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={statusDisplay.variant as any}
                                                        className={statusDisplay.className}
                                                    >
                                                        {statusDisplay.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm font-mono">
                                                            {showApiKey[sensor.parkingStatusSensorId]
                                                                ? sensor.apiKey
                                                                : "••••••••••••••••"}
                                                        </span>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() => toggleShowApiKey(sensor.parkingStatusSensorId)}
                                                                    >
                                                                        {showApiKey[sensor.parkingStatusSensorId] ? (
                                                                            <EyeOff className="h-3 w-3" />
                                                                        ) : (
                                                                            <Eye className="h-3 w-3" />
                                                                        )}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {showApiKey[sensor.parkingStatusSensorId] ? "Ẩn" : "Hiện"} API key
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() => copyToClipboard(sensor.apiKey)}
                                                                    >
                                                                        <Copy className="h-3 w-3" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Sao chép
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center gap-1">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => {
                                                                            setEditingSensor(sensor);
                                                                            setIsEditModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Chỉnh sửa
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                                                        onClick={() => {
                                                                            if (window.confirm("Bạn có chắc chắn muốn xóa cảm biến này?")) {
                                                                                handleDeleteSensor(sensor.parkingStatusSensorId);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Xóa
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Sensor Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Thêm cảm biến mới</DialogTitle>
                        <DialogDescription>
                            Thêm một cảm biến mới vào hệ thống. API key sẽ được tạo tự động.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="space-y-2">
                            <Label htmlFor="sensorName" className="font-medium">Tên cảm biến</Label>
                            <Input
                                id="sensorName"
                                placeholder="Nhập tên cảm biến"
                                value={newSensor.name || ""}
                                onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                            />
                        </div>

                        {/* Lựa chọn bãi đỗ xe và khu vực */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parkingLot" className="font-medium">Bãi đỗ xe</Label>
                                <Select
                                    value={selectedLot?.toString() || ""}
                                    onValueChange={(value) => setSelectedLot(parseInt(value))}
                                >
                                    <SelectTrigger id="parkingLot" className="w-full">
                                        <SelectValue placeholder="Chọn bãi đỗ xe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Bãi đỗ xe</SelectLabel>
                                            {parkingLots.map(lot => (
                                                <SelectItem
                                                    key={lot.parkingLotId}
                                                    value={lot.parkingLotId?.toString()}
                                                >
                                                    {lot.address}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="area" className="font-medium">Khu vực</Label>
                                <Select
                                    value={selectedArea?.toString() || ""}
                                    onValueChange={(value) => setSelectedArea(parseInt(value))}
                                    disabled={!selectedLot || areas.length === 0}
                                >
                                    <SelectTrigger id="area" className="w-full">
                                        <SelectValue placeholder="Chọn khu vực" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Khu vực</SelectLabel>
                                            {areas.map(area => (
                                                <SelectItem
                                                    key={area.areaId}
                                                    value={area.areaId?.toString()}
                                                >
                                                    {area.areaName}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {!selectedLot && <p className="text-xs text-gray-500 italic mt-1">Vui lòng chọn bãi đỗ xe trước</p>}
                            </div>
                        </div>

                        {/* Lựa chọn tầng và vị trí đỗ xe */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="floor" className="font-medium">Tầng</Label>
                                <Select
                                    value={selectedFloor?.toString() || ""}
                                    onValueChange={(value) => setSelectedFloor(parseInt(value))}
                                    disabled={!selectedArea || floors.length === 0}
                                >
                                    <SelectTrigger id="floor" className="w-full">
                                        <SelectValue placeholder="Chọn tầng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Tầng</SelectLabel>
                                            {floors.map(floor => (
                                                <SelectItem
                                                    key={floor.floorId}
                                                    value={floor.floorId?.toString()}
                                                >
                                                    {floor.floorName}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {!selectedArea && <p className="text-xs text-gray-500 italic mt-1">Vui lòng chọn khu vực trước</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parkingSpace" className="font-medium">Vị trí đỗ xe</Label>
                                <Select
                                    value={newSensor.parkingSpaceId?.toString() || ""}
                                    onValueChange={(value) => {
                                        const selectedSpace = parkingSpaces.find(
                                            space => space.parkingSpaceId === parseInt(value)
                                        );
                                        const spaceName = selectedSpace?.parkingSpaceName || "";
                                        setNewSensor({
                                            ...newSensor,
                                            parkingSpaceId: parseInt(value),
                                            parkingSpaceName: spaceName,
                                            // Set a default name based on the parking space if not set already
                                            name: newSensor.name || `Cảm biến ${spaceName}`,
                                        });
                                    }}
                                    disabled={!selectedFloor || parkingSpaces.length === 0}
                                >
                                    <SelectTrigger id="parkingSpace" className="w-full">
                                        <SelectValue placeholder="Chọn vị trí đỗ xe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Vị trí đỗ xe</SelectLabel>
                                            {parkingSpaces.map(space => (
                                                <SelectItem
                                                    key={space.parkingSpaceId}
                                                    value={space.parkingSpaceId?.toString()}
                                                >
                                                    {space.parkingSpaceName}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {!selectedFloor && <p className="text-xs text-gray-500 italic mt-1">Vui lòng chọn tầng trước</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="font-medium">Trạng thái</Label>
                            <Select
                                value={newSensor.status || "active"}
                                onValueChange={(value) => setNewSensor({ ...newSensor, status: value })}
                            >
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                            Hoạt động
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                            Không hoạt động
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="maintenance">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                                            Đang bảo trì
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apiKey" className="font-medium">API Key</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="apiKey"
                                    placeholder="API Key sẽ được tạo tự động"
                                    readOnly
                                    value={newSensor.apiKey || ""}
                                    className="bg-gray-50"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setNewSensor({ ...newSensor, apiKey: generateApiKey() })}
                                >
                                    Tạo
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 italic mt-1">API Key dùng để xác thực cảm biến khi gửi dữ liệu</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={() => handleAddSensor(newSensor)}
                            disabled={!newSensor.parkingSpaceId || !newSensor.apiKey}
                        >
                            Thêm cảm biến
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
