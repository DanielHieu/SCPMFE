"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    PlusCircle,
    ListFilter,
    Edit,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getParkingStatusSensors } from "@/lib/api/parking-space.api";
import { ParkingStatusSensor } from "@/types/parkingStatusSensor";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Mở rộng kiểu dữ liệu cho nhu cầu giao diện
type SensorWithUI = ParkingStatusSensor & {
    showApiKey?: boolean;
    lastMaintenance?: string;
    batteryLevel?: number;
    location?: string;
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
    const [parkingSpaceOptions, setParkingSpaceOptions] = useState<Array<{ id: number, name: string }>>([]);

    // Trạng thái cho lựa chọn phân cấp
    const [parkingLots, setParkingLots] = useState<Array<{ id: number, name: string }>>([]);
    const [areas, setAreas] = useState<Array<{ id: number, name: string, lotId: number }>>([]);
    const [floors, setFloors] = useState<Array<{ id: number, name: string, areaId: number }>>([]);
    const [parkingSpaces, setParkingSpaces] = useState<Array<{ id: number, name: string, floorId: number }>>([]);

    // Giá trị đã chọn cho lựa chọn phân cấp
    const [selectedLot, setSelectedLot] = useState<number | null>(null);
    const [selectedArea, setSelectedArea] = useState<number | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

    const filterDisplayMap: Record<FilterStatus, string> = {
        all: "Tất cả cảm biến",
        active: "Đang hoạt động",
        inactive: "Không hoạt động",
        maintenance: "Đang bảo trì",
    };

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
    const fetchSensors = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getParkingStatusSensors();

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
            const activeCount = mappedSensors.filter(s => s.status.toLowerCase() === "active").length;
            const inactiveCount = mappedSensors.filter(s => s.status.toLowerCase() === "inactive").length;
            const maintenanceCount = mappedSensors.filter(s => s.status.toLowerCase() === "maintenance").length;

            setCounts({
                all: allCount,
                active: activeCount,
                inactive: inactiveCount,
                maintenance: maintenanceCount,
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định");
            toast.error("Không thể tải dữ liệu cảm biến");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSensors();
    }, []);

    // Ánh xạ trạng thái từ API sang bộ lọc giao diện
    const mapStatusToFilter = (status: string): FilterStatus => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === "active") return "active";
        if (lowerStatus === "inactive") return "inactive";
        if (lowerStatus === "maintenance") return "maintenance";
        return "all";
    };

    // Lọc cảm biến dựa trên từ khóa tìm kiếm và trạng thái
    const filteredSensors = sensors.filter((sensor) => {
        const matchesSearch =
            sensor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sensor.parkingSpaceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sensor.parkingStatusSensorId?.toString().includes(searchTerm.toLowerCase());

        const sensorStatus = mapStatusToFilter(sensor.status);
        const matchesStatus = filterStatus === "all" || sensorStatus === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Xử lý thêm cảm biến mới
    const handleAddSensor = async (sensorData: Partial<SensorWithUI>) => {
        try {
            // Trong triển khai thực tế, bạn sẽ gọi API để tạo cảm biến
            toast.success("Chức năng chưa được triển khai trong bản demo này");
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

    // Xử lý cập nhật cảm biến
    const handleUpdateSensor = async (sensorData: SensorWithUI) => {
        try {
            // Trong triển khai thực tế, bạn sẽ gọi API để cập nhật cảm biến
            toast.success("Chức năng chưa được triển khai trong bản demo này");
            setIsEditModalOpen(false);
            setEditingSensor(null);
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
            // Hiện tại chúng ta sử dụng dữ liệu giả, nhưng trong ứng dụng thực tế, bạn sẽ lấy từ API
            const mockParkingLots = [
                { id: 1, name: "Bãi đỗ xe A - Quận 1" },
                { id: 2, name: "Bãi đỗ xe B - Quận 2" },
                { id: 3, name: "Bãi đỗ xe C - Quận 3" },
            ];
            setParkingLots(mockParkingLots);
        } catch (err) {
            console.error("Không thể tải dữ liệu bãi đỗ xe:", err);
            toast.error("Không thể tải dữ liệu bãi đỗ xe");
        }
    };

    // Lấy danh sách khu vực dựa trên bãi đỗ xe đã chọn
    const fetchAreas = async (lotId: number) => {
        try {
            // Dữ liệu giả cho khu vực
            const mockAreas = [
                { id: 1, name: "Khu vực A", lotId: 1 },
                { id: 2, name: "Khu vực B", lotId: 1 },
                { id: 3, name: "Khu vực C", lotId: 2 },
                { id: 4, name: "Khu vực D", lotId: 2 },
                { id: 5, name: "Khu vực E", lotId: 3 },
            ];
            const filteredAreas = mockAreas.filter(area => area.lotId === lotId);
            setAreas(filteredAreas);
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
            // Dữ liệu giả cho tầng
            const mockFloors = [
                { id: 1, name: "Tầng 1", areaId: 1 },
                { id: 2, name: "Tầng 2", areaId: 1 },
                { id: 3, name: "Tầng 1", areaId: 2 },
                { id: 4, name: "Tầng 1", areaId: 3 },
                { id: 5, name: "Tầng 2", areaId: 3 },
                { id: 6, name: "Tầng 1", areaId: 4 },
                { id: 7, name: "Tầng 1", areaId: 5 },
            ];
            const filteredFloors = mockFloors.filter(floor => floor.areaId === areaId);
            setFloors(filteredFloors);
            setSelectedFloor(null); // Đặt lại tầng đã chọn khi khu vực thay đổi
        } catch (err) {
            console.error("Không thể tải dữ liệu tầng:", err);
            toast.error("Không thể tải dữ liệu tầng");
        }
    };

    // Lấy danh sách vị trí đỗ xe dựa trên tầng đã chọn
    const fetchParkingSpaces = async (floorId: number) => {
        try {
            // Dữ liệu giả cho vị trí đỗ xe
            const mockParkingSpaces = [
                { id: 1, name: "A1", floorId: 1 },
                { id: 2, name: "A2", floorId: 1 },
                { id: 3, name: "A3", floorId: 1 },
                { id: 4, name: "B1", floorId: 2 },
                { id: 5, name: "B2", floorId: 2 },
                { id: 6, name: "C1", floorId: 3 },
                { id: 7, name: "D1", floorId: 4 },
                { id: 8, name: "D2", floorId: 4 },
                { id: 9, name: "E1", floorId: 5 },
                { id: 10, name: "F1", floorId: 6 },
                { id: 11, name: "G1", floorId: 7 },
            ];
            const filteredSpaces = mockParkingSpaces.filter(space => space.floorId === floorId);
            setParkingSpaces(filteredSpaces);
        } catch (err) {
            console.error("Không thể tải dữ liệu vị trí đỗ xe:", err);
            toast.error("Không thể tải dữ liệu vị trí đỗ xe");
        }
    };

    // Thêm hàm để lấy danh sách vị trí đỗ xe (phương thức cũ)
    const fetchParkingSpaceOptions = async () => {
        try {
            // Hiện tại chúng ta sử dụng dữ liệu giả, nhưng trong ứng dụng thực tế, bạn sẽ lấy từ API
            const mockParkingSpaces = [
                { id: 1, name: "A1 - Tầng 1 - Khu A" },
                { id: 2, name: "A2 - Tầng 1 - Khu A" },
                { id: 3, name: "B1 - Tầng 2 - Khu B" },
                { id: 4, name: "B2 - Tầng 2 - Khu B" },
                { id: 5, name: "C1 - Tầng 1 - Khu C" },
            ];
            setParkingSpaceOptions(mockParkingSpaces);
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
            fetchParkingSpaceOptions(); // Phương thức cũ
        } else if (isEditModalOpen) {
            fetchParkingSpaceOptions(); // Phương thức cũ cho modal sửa
        }
    }, [isAddModalOpen, isEditModalOpen]);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý cảm biến</h1>
                    <p className="text-muted-foreground">Xem và quản lý các cảm biến trong hệ thống</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => fetchSensors()} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Làm mới
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Thêm cảm biến
                    </Button>
                </div>
            </div>

            {/* Bộ lọc và Tìm kiếm */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-3">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative w-full max-w-sm">
                                <Input
                                    placeholder="Tìm kiếm cảm biến..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                                <div className="absolute left-2.5 top-2.5 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="min-w-[160px]">
                                        <ListFilter className="h-4 w-4 mr-2" />
                                        {filterDisplayMap[filterStatus]}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup
                                        value={filterStatus}
                                        onValueChange={(value) => setFilterStatus(value as FilterStatus)}
                                    >
                                        <DropdownMenuRadioItem value="all">
                                            Tất cả ({counts.all})
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="active">
                                            Đang hoạt động ({counts.active})
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="inactive">
                                            Không hoạt động ({counts.inactive})
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="maintenance">
                                            Đang bảo trì ({counts.maintenance})
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tổng cảm biến</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{counts.all}</div>
                        <div className="text-xs text-muted-foreground">
                            {counts.active} hoạt động, {counts.inactive} không hoạt động, {counts.maintenance} bảo trì
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Danh sách cảm biến */}
            <div className="bg-white rounded-lg border shadow-sm">
                {isLoading ? (
                    <div className="p-8">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex flex-col space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Lỗi khi tải dữ liệu cảm biến</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={fetchSensors}>Thử lại</Button>
                    </div>
                ) : filteredSensors.length === 0 ? (
                    <div className="p-8 text-center">
                        <h3 className="text-lg font-medium">Không tìm thấy cảm biến</h3>
                        <p className="text-muted-foreground">
                            {searchTerm
                                ? "Hãy điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc"
                                : "Thêm cảm biến mới để bắt đầu"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tên</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vị trí</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">API Key</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vị trí đỗ xe</th>
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
                                            <td className="px-4 py-3 text-sm">{sensor.location || "Không có thông tin"}</td>
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
                                            <td className="px-4 py-3 text-sm">{sensor.parkingSpaceName}</td>
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

            {/* Add Sensor Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Thêm cảm biến mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="sensorName">Tên cảm biến</Label>
                            <Input
                                id="sensorName"
                                placeholder="Nhập tên cảm biến"
                                value={newSensor.name || ""}
                                onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parkingSpace">Vị trí đỗ xe</Label>
                            <Select
                                value={newSensor.parkingSpaceId?.toString() || ""}
                                onValueChange={(value) => {
                                    const selectedSpace = parkingSpaceOptions.find(
                                        space => space.id === parseInt(value)
                                    );
                                    const spaceName = selectedSpace?.name || "";
                                    setNewSensor({
                                        ...newSensor,
                                        parkingSpaceId: parseInt(value),
                                        parkingSpaceName: spaceName,
                                        // Set a default name based on the parking space if not set already
                                        name: newSensor.name || `Cảm biến ${spaceName}`,
                                        // Set a default location based on the parking space
                                        location: newSensor.location || `Bãi đỗ xe - Vị trí ${spaceName}`
                                    });
                                }}
                            >
                                <SelectTrigger id="parkingSpace">
                                    <SelectValue placeholder="Chọn vị trí đỗ xe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Vị trí đỗ xe</SelectLabel>
                                        {parkingSpaceOptions.map(space => (
                                            <SelectItem
                                                key={space.id}
                                                value={space.id.toString()}
                                            >
                                                {space.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Vị trí cảm biến</Label>
                            <Input
                                id="location"
                                placeholder="Vị trí lắp đặt cảm biến"
                                value={newSensor.location || ""}
                                onChange={(e) => setNewSensor({ ...newSensor, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                value={newSensor.status || "active"}
                                onValueChange={(value) => setNewSensor({ ...newSensor, status: value })}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Hoạt động</SelectItem>
                                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                                    <SelectItem value="maintenance">Đang bảo trì</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="apiKey"
                                    placeholder="API Key sẽ được tạo tự động"
                                    readOnly
                                    value={newSensor.apiKey || ""}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setNewSensor({ ...newSensor, apiKey: generateApiKey() })}
                                >
                                    Tạo
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button
                                onClick={() => handleAddSensor(newSensor)}
                                disabled={!newSensor.parkingSpaceId || !newSensor.status}
                            >
                                Thêm cảm biến
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Sensor Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => {
                setIsEditModalOpen(open);
                if (!open) setEditingSensor(null);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa cảm biến</DialogTitle>
                    </DialogHeader>
                    {editingSensor && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit-sensorName">Tên cảm biến</Label>
                                <Input
                                    id="edit-sensorName"
                                    placeholder="Nhập tên cảm biến"
                                    value={editingSensor.name || ""}
                                    onChange={(e) => setEditingSensor({ ...editingSensor, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-parkingSpace">Vị trí đỗ xe</Label>
                                <Select
                                    value={editingSensor.parkingSpaceId?.toString() || ""}
                                    onValueChange={(value) => {
                                        const selectedSpace = parkingSpaceOptions.find(
                                            space => space.id === parseInt(value)
                                        );
                                        setEditingSensor({
                                            ...editingSensor,
                                            parkingSpaceId: parseInt(value),
                                            parkingSpaceName: selectedSpace?.name || ""
                                        });
                                    }}
                                >
                                    <SelectTrigger id="edit-parkingSpace">
                                        <SelectValue placeholder="Chọn vị trí đỗ xe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Vị trí đỗ xe</SelectLabel>
                                            {parkingSpaceOptions.map(space => (
                                                <SelectItem
                                                    key={space.id}
                                                    value={space.id.toString()}
                                                >
                                                    {space.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-location">Vị trí cảm biến</Label>
                                <Input
                                    id="edit-location"
                                    placeholder="Vị trí lắp đặt cảm biến"
                                    value={editingSensor.location || ""}
                                    onChange={(e) => setEditingSensor({ ...editingSensor, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Trạng thái</Label>
                                <Select
                                    value={editingSensor.status || "active"}
                                    onValueChange={(value) => setEditingSensor({ ...editingSensor, status: value })}
                                >
                                    <SelectTrigger id="edit-status">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Hoạt động</SelectItem>
                                        <SelectItem value="inactive">Không hoạt động</SelectItem>
                                        <SelectItem value="maintenance">Đang bảo trì</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-apiKey">API Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="edit-apiKey"
                                        placeholder="API Key"
                                        value={editingSensor.apiKey || ""}
                                        readOnly
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingSensor({ ...editingSensor, apiKey: generateApiKey() })}
                                    >
                                        Tạo mới
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingSensor(null);
                                }}>
                                    Hủy
                                </Button>
                                <Button
                                    onClick={() => handleUpdateSensor(editingSensor)}
                                    disabled={!editingSensor.parkingSpaceId || !editingSensor.status}
                                >
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
