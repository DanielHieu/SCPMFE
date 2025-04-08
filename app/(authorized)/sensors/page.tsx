"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, ListFilter, Edit, Trash2, Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Sensor = {
    sensorId: string;
    sensorName: string;
    location: string;
    status: "active" | "inactive" | "maintenance";
    lastMaintenance: string;
    batteryLevel: number;
    parkingSpaceId: string;
    apiKey: string;
};


type FilterStatus = "all" | "active" | "inactive" | "maintenance";

export default function SensorsPage() {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
    const [newSensor, setNewSensor] = useState<Partial<Sensor>>({});
    const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
    const [counts, setCounts] = useState({
        all: 0,
        active: 0,
        inactive: 0,
        maintenance: 0,
    });

    const filterDisplayMap: Record<FilterStatus, string> = {
        all: "Tất cả cảm biến",
        active: "Đang hoạt động",
        inactive: "Không hoạt động",
        maintenance: "Đang bảo trì",
    };

    // Generate a random API key
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

    // Copy API key to clipboard
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("API key đã được sao chép");
        } catch (err) {
            toast.error("Không thể sao chép API key");
        }
    };

    // Toggle showing/hiding API key
    const toggleShowApiKey = (sensorId: string) => {
        setShowApiKey(prev => ({
            ...prev,
            [sensorId]: !prev[sensorId]
        }));
    };

    // Fetch sensors data
    const fetchSensors = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Replace with actual API call
            // const response = await fetch("/api/sensors");
            // if (!response.ok) {
            //     throw new Error("Failed to fetch sensors");
            // }
            // const data = await response.json();

            // Mock data for development
            const mockData = [
                {
                    sensorId: "SEN001",
                    sensorName: "IR Sensor A1",
                    location: "Parking Lot A - Floor 1",
                    status: "active",
                    lastMaintenance: "2023-10-15",
                    batteryLevel: 85,
                    parkingSpaceId: "PS001",
                    apiKey: generateApiKey(),
                },
                {
                    sensorId: "SEN002",
                    sensorName: "IR Sensor A2",
                    location: "Parking Lot A - Floor 1",
                    status: "inactive",
                    lastMaintenance: "2023-09-20",
                    batteryLevel: 12,
                    parkingSpaceId: "PS002",
                    apiKey: generateApiKey(),
                },
                {
                    sensorId: "SEN003",
                    sensorName: "IR Sensor B1",
                    location: "Parking Lot B - Floor 2",
                    status: "maintenance",
                    lastMaintenance: "2023-11-05",
                    batteryLevel: 45,
                    parkingSpaceId: "PS003",
                    apiKey: generateApiKey(),
                },
                {
                    sensorId: "SEN004",
                    sensorName: "IR Sensor B2",
                    location: "Parking Lot B - Floor 2",
                    status: "active",
                    lastMaintenance: "2023-10-30",
                    batteryLevel: 92,
                    parkingSpaceId: "PS004",
                    apiKey: generateApiKey(),
                },
                {
                    sensorId: "SEN005",
                    sensorName: "IR Sensor C1",
                    location: "Parking Lot C - Floor 1",
                    status: "active",
                    lastMaintenance: "2023-11-10",
                    batteryLevel: 78,
                    parkingSpaceId: "PS005",
                    apiKey: generateApiKey(),
                },
            ] as Sensor[];

            setSensors(mockData);

            // Update counts
            const allCount = mockData.length;
            const activeCount = mockData.filter(s => s.status === "active").length;
            const inactiveCount = mockData.filter(s => s.status === "inactive").length;
            const maintenanceCount = mockData.filter(s => s.status === "maintenance").length;

            setCounts({
                all: allCount,
                active: activeCount,
                inactive: inactiveCount,
                maintenance: maintenanceCount,
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            toast.error("Failed to load sensors");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSensors();
    }, []);

    // Filter sensors based on search term and status
    const filteredSensors = sensors.filter((sensor) => {
        const matchesSearch =
            sensor.sensorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sensor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sensor.sensorId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "all" || sensor.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Handle adding a new sensor
    const handleAddSensor = async (sensorData: Partial<Sensor>) => {
        try {
            // Generate API key if not provided
            if (!sensorData.apiKey) {
                sensorData.apiKey = generateApiKey();
            }
            
            // Replace with actual API call
            // const response = await fetch("/api/sensors", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(sensorData),
            // });

            // if (!response.ok) {
            //     throw new Error("Failed to add sensor");
            // }

            toast.success("Cảm biến đã được thêm thành công");
            setIsAddModalOpen(false);
            setNewSensor({}); // Reset form
            fetchSensors();
        } catch (err) {
            toast.error("Lỗi khi thêm cảm biến: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    };

    // Handle updating a sensor
    const handleUpdateSensor = async (sensorData: Sensor) => {
        try {
            // Replace with actual API call
            // const response = await fetch(`/api/sensors/${sensorData.sensorId}`, {
            //     method: "PUT",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(sensorData),
            // });

            // if (!response.ok) {
            //     throw new Error("Failed to update sensor");
            // }

            toast.success("Cảm biến đã được cập nhật thành công");
            setIsEditModalOpen(false);
            setEditingSensor(null);
            fetchSensors();
        } catch (err) {
            toast.error("Lỗi khi cập nhật cảm biến: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    };

    // Handle deleting a sensor
    const handleDeleteSensor = async (sensorId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa cảm biến này?")) {
            return;
        }

        try {
            // Replace with actual API call
            // const response = await fetch(`/api/sensors/${sensorId}`, {
            //     method: "DELETE",
            // });

            // if (!response.ok) {
            //     throw new Error("Failed to delete sensor");
            // }

            toast.success("Cảm biến đã được xóa thành công");
            fetchSensors();
        } catch (err) {
            toast.error("Lỗi khi xóa cảm biến: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Get battery level color
    const getBatteryLevelColor = (level: number) => {
        if (level >= 70) return "text-green-600";
        if (level >= 30) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Quản lý cảm biến</h1>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 px-1">
                <div className="w-full md:w-auto md:flex-grow lg:max-w-md">
                    <Input
                        placeholder="Tìm kiếm theo tên, vị trí, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-full"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                                <ListFilter className="w-4 h-4 mr-2" />
                                Lọc: {filterDisplayMap[filterStatus]}{" "}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                                value={filterStatus}
                                onValueChange={(value) =>
                                    setFilterStatus(value as FilterStatus)
                                }
                            >
                                <DropdownMenuRadioItem value="all">
                                    Tất cả cảm biến ({counts.all})
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
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-9">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Thêm cảm biến
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Thêm cảm biến mới</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="sensorName">Tên cảm biến</Label>
                                        <Input 
                                            id="sensorName" 
                                            placeholder="Nhập tên cảm biến" 
                                            value={newSensor.sensorName || ''}
                                            onChange={(e) => setNewSensor({ ...newSensor, sensorName: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Vị trí</Label>
                                        <Input 
                                            id="location" 
                                            placeholder="Nhập vị trí" 
                                            value={newSensor.location || ''}
                                            onChange={(e) => setNewSensor({ ...newSensor, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Trạng thái</Label>
                                        <Select
                                            value={newSensor.status}
                                            onValueChange={(value) => setNewSensor({
                                                ...newSensor,
                                                status: value as "active" | "inactive" | "maintenance"
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Đang hoạt động</SelectItem>
                                                <SelectItem value="inactive">Không hoạt động</SelectItem>
                                                <SelectItem value="maintenance">Đang bảo trì</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="parkingSpaceId">Vị trí đỗ xe</Label>
                                        <Input 
                                            id="parkingSpaceId" 
                                            placeholder="Nhập ID vị trí đỗ xe" 
                                            value={newSensor.parkingSpaceId || ''}
                                            onChange={(e) => setNewSensor({ ...newSensor, parkingSpaceId: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="lastMaintenance">Lần bảo trì cuối</Label>
                                        <Input 
                                            id="lastMaintenance" 
                                            type="date" 
                                            value={newSensor.lastMaintenance || ''}
                                            onChange={(e) => setNewSensor({ ...newSensor, lastMaintenance: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="batteryLevel">Mức pin (%)</Label>
                                        <Input 
                                            id="batteryLevel" 
                                            type="number" 
                                            min="0" 
                                            max="100" 
                                            placeholder="Nhập mức pin" 
                                            value={newSensor.batteryLevel || ''}
                                            onChange={(e) => setNewSensor({ ...newSensor, batteryLevel: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="apiKey">API Key</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="apiKey" 
                                            placeholder="API Key sẽ được tạo tự động" 
                                            value={newSensor.apiKey || ''}
                                            onChange={(e) => setNewSensor({ ...newSensor, apiKey: e.target.value })}
                                            className="flex-1"
                                            disabled
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setNewSensor({ ...newSensor, apiKey: generateApiKey() })}
                                            className="h-9 w-9"
                                            title="Tạo API Key mới"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        API Key sẽ được tạo tự động khi thêm cảm biến. Chỉ hiển thị một lần.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setNewSensor({});
                                    }}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        handleAddSensor(newSensor);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Thêm cảm biến
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-red-500">{error}</div>
                </div>
            ) : filteredSensors.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Không tìm thấy cảm biến nào</div>
                </div>
            ) : (
                <div className="rounded-md border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">ID</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Tên cảm biến</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Vị trí</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Trạng thái</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Lần bảo trì cuối</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Mức pin</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">API Key</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredSensors.map((sensor) => (
                                    <tr key={sensor.sensorId} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-700">{sensor.sensorId}</td>
                                        <td className="py-3 px-4 font-medium">{sensor.sensorName}</td>
                                        <td className="py-3 px-4 text-gray-700">{sensor.location}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sensor.status === "active" ? "bg-green-100 text-green-800" :
                                                    sensor.status === "inactive" ? "bg-red-100 text-red-800" :
                                                        "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                {sensor.status === "active" ? "Đang hoạt động" :
                                                    sensor.status === "inactive" ? "Không hoạt động" :
                                                        "Đang bảo trì"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">{formatDate(sensor.lastMaintenance)}</td>
                                        <td className="py-3 px-4">
                                            <span className={getBatteryLevelColor(sensor.batteryLevel)}>
                                                {sensor.batteryLevel}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="max-w-[120px] truncate font-mono text-xs">
                                                    {showApiKey[sensor.sensorId] ? sensor.apiKey : '••••••••••••••••'}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleShowApiKey(sensor.sensorId)}
                                                    className="h-8 w-8 p-0"
                                                    title={showApiKey[sensor.sensorId] ? "Ẩn API Key" : "Hiển thị API Key"}
                                                >
                                                    {showApiKey[sensor.sensorId] ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(sensor.apiKey)}
                                                    className="h-8 w-8 p-0"
                                                    title="Sao chép API Key"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingSensor(sensor);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteSensor(sensor.sensorId)}
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa cảm biến</DialogTitle>
                    </DialogHeader>
                    {editingSensor && (
                        <div>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-sensorName">Tên cảm biến</Label>
                                        <Input
                                            id="edit-sensorName"
                                            defaultValue={editingSensor.sensorName}
                                            onChange={(e) => setEditingSensor({ ...editingSensor, sensorName: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-location">Vị trí</Label>
                                        <Input
                                            id="edit-location"
                                            defaultValue={editingSensor.location}
                                            onChange={(e) => setEditingSensor({ ...editingSensor, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-status">Trạng thái</Label>
                                        <Select
                                            defaultValue={editingSensor.status}
                                            onValueChange={(value) => setEditingSensor({
                                                ...editingSensor,
                                                status: value as "active" | "inactive" | "maintenance"
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Đang hoạt động</SelectItem>
                                                <SelectItem value="inactive">Không hoạt động</SelectItem>
                                                <SelectItem value="maintenance">Đang bảo trì</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-parkingSpaceId">Vị trí đỗ xe</Label>
                                        <Input
                                            id="edit-parkingSpaceId"
                                            defaultValue={editingSensor.parkingSpaceId}
                                            onChange={(e) => setEditingSensor({ ...editingSensor, parkingSpaceId: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-lastMaintenance">Lần bảo trì cuối</Label>
                                        <Input
                                            id="edit-lastMaintenance"
                                            type="date"
                                            defaultValue={editingSensor.lastMaintenance}
                                            onChange={(e) => setEditingSensor({ ...editingSensor, lastMaintenance: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-batteryLevel">Mức pin (%)</Label>
                                        <Input
                                            id="edit-batteryLevel"
                                            type="number"
                                            min="0"
                                            max="100"
                                            defaultValue={editingSensor.batteryLevel}
                                            onChange={(e) => setEditingSensor({ ...editingSensor, batteryLevel: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-apiKey">API Key</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="edit-apiKey" 
                                            defaultValue={editingSensor.apiKey}
                                            className="flex-1 font-mono"
                                            readOnly
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard(editingSensor.apiKey)}
                                            className="h-9 w-9"
                                            title="Sao chép API Key"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                if (confirm("Bạn có chắc chắn muốn tạo API Key mới? Key cũ sẽ không còn sử dụng được.")) {
                                                    setEditingSensor({ ...editingSensor, apiKey: generateApiKey() });
                                                    toast.info("API Key mới đã được tạo. Nhớ lưu lại trước khi đóng.");
                                                }
                                            }}
                                            className="h-9 w-9"
                                            title="Tạo API Key mới"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Cẩn thận khi tạo API Key mới, key cũ sẽ không còn hoạt động.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Đóng
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        handleUpdateSensor(editingSensor);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Cập nhật
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
