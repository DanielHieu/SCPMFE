"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, ListFilter, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Task = {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    assigneeName: string;
    status: "pending" | "in-progress" | "completed";
    priority: "low" | "medium" | "high";
    dueDate: string;
    createdAt: string;
};

type FilterStatus = "all" | "pending" | "in-progress" | "completed";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [counts, setCounts] = useState({
        all: 0,
        pending: 0,
        "in-progress": 0,
        completed: 0,
    });

    // Mock data for demonstration
    const mockTasks: Task[] = [
        {
            id: "1",
            title: "Kiểm tra hệ thống cảm biến",
            description: "Kiểm tra và bảo trì hệ thống cảm biến tại bãi đậu xe A",
            assignedTo: "user1",
            assigneeName: "Nguyễn Văn A",
            status: "pending",
            priority: "high",
            dueDate: "2023-12-15",
            createdAt: "2023-12-01",
        },
        {
            id: "2",
            title: "Cập nhật phần mềm quản lý",
            description: "Cập nhật phiên bản mới cho phần mềm quản lý bãi đỗ xe",
            assignedTo: "user2",
            assigneeName: "Trần Thị B",
            status: "in-progress",
            priority: "medium",
            dueDate: "2023-12-20",
            createdAt: "2023-12-05",
        },
        {
            id: "3",
            title: "Sửa chữa barrier cổng vào",
            description: "Sửa chữa barrier tại cổng vào bị hỏng",
            assignedTo: "user3",
            assigneeName: "Lê Văn C",
            status: "completed",
            priority: "high",
            dueDate: "2023-12-10",
            createdAt: "2023-12-02",
        },
        {
            id: "4",
            title: "Kiểm tra camera an ninh",
            description: "Kiểm tra hệ thống camera an ninh tại tầng 2",
            assignedTo: "user1",
            assigneeName: "Nguyễn Văn A",
            status: "pending",
            priority: "low",
            dueDate: "2023-12-25",
            createdAt: "2023-12-07",
        },
        {
            id: "5",
            title: "Báo cáo doanh thu tháng",
            description: "Lập báo cáo doanh thu tháng 11/2023",
            assignedTo: "user2",
            assigneeName: "Trần Thị B",
            status: "in-progress",
            priority: "medium",
            dueDate: "2023-12-30",
            createdAt: "2023-12-10",
        },
    ];

    const filterDisplayMap: Record<FilterStatus, string> = {
        all: "Tất cả nhiệm vụ",
        pending: "Chờ xử lý",
        "in-progress": "Đang thực hiện",
        completed: "Hoàn thành",
    };

    // Fetch tasks data
    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // In a real app, this would be an API call
                // const response = await fetch("/api/tasks");
                // const data = await response.json();

                // Using mock data for demonstration
                setTimeout(() => {
                    setTasks(mockTasks);

                    // Calculate counts
                    const all = mockTasks.length;
                    const pending = mockTasks.filter(task => task.status === "pending").length;
                    const inProgress = mockTasks.filter(task => task.status === "in-progress").length;
                    const completed = mockTasks.filter(task => task.status === "completed").length;

                    setCounts({
                        all,
                        pending,
                        "in-progress": inProgress,
                        completed,
                    });

                    setIsLoading(false);
                }, 1000);
            } catch (err) {
                setError("Failed to fetch tasks");
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Filter tasks based on search term and status
    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.assigneeName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "all" || task.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Handle adding a new task
    const handleAddTask = async (taskData: Partial<Task>) => {
        try {
            // In a real app, this would be an API call
            // const response = await fetch("/api/tasks", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(taskData),
            // });

            // Mock implementation
            const newTask: Task = {
                id: `task-${Date.now()}`,
                title: taskData.title || "New Task",
                description: taskData.description || "",
                assignedTo: taskData.assignedTo || "user1",
                assigneeName: taskData.assigneeName || "Nguyễn Văn A",
                status: taskData.status || "pending",
                priority: taskData.priority || "medium",
                dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString().split('T')[0],
            };

            setTasks([...tasks, newTask]);

            // Update counts
            setCounts({
                ...counts,
                all: counts.all + 1,
                [newTask.status]: counts[newTask.status as keyof typeof counts] + 1,
            });

            toast.success("Nhiệm vụ đã được tạo thành công");
            setIsAddModalOpen(false);
        } catch (err) {
            toast.error("Lỗi khi tạo nhiệm vụ: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    };

    // Handle updating a task
    const handleUpdateTask = async (taskData: Task) => {
        try {
            // In a real app, this would be an API call
            // const response = await fetch(`/api/tasks/${taskData.id}`, {
            //     method: "PUT",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(taskData),
            // });

            // Mock implementation
            const oldStatus = tasks.find(t => t.id === taskData.id)?.status;
            const updatedTasks = tasks.map(task =>
                task.id === taskData.id ? taskData : task
            );

            setTasks(updatedTasks);

            // Update counts if status changed
            if (oldStatus && oldStatus !== taskData.status) {
                setCounts({
                    ...counts,
                    [oldStatus]: counts[oldStatus as keyof typeof counts] - 1,
                    [taskData.status]: counts[taskData.status as keyof typeof counts] + 1,
                });
            }

            toast.success("Nhiệm vụ đã được cập nhật thành công");
            setIsEditModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            toast.error("Lỗi khi cập nhật nhiệm vụ: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Get status badge
    const getStatusBadge = (status: Task['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="w-3 h-3 mr-1" /> Chờ xử lý
                </Badge>;
            case 'in-progress':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <AlertCircle className="w-3 h-3 mr-1" /> Đang thực hiện
                </Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành
                </Badge>;
            default:
                return null;
        }
    };

    // Get priority badge
    const getPriorityBadge = (priority: Task['priority']) => {
        switch (priority) {
            case 'low':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Thấp</Badge>;
            case 'medium':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Trung bình</Badge>;
            case 'high':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cao</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Quản lý nhiệm vụ</h1>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 px-1">
                <div className="w-full md:w-auto md:flex-grow lg:max-w-md">
                    <Input
                        placeholder="Tìm kiếm nhiệm vụ/người được giao..."
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
                                    Tất cả nhiệm vụ ({counts.all})
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="pending">
                                    Chờ xử lý ({counts.pending})
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="in-progress">
                                    Đang thực hiện ({counts["in-progress"]})
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="completed">
                                    Hoàn thành ({counts.completed})
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-9">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Thêm nhiệm vụ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Thêm nhiệm vụ mới</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Tiêu đề</Label>
                                    <Input id="title" placeholder="Nhập tiêu đề nhiệm vụ" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea id="description" placeholder="Nhập mô tả chi tiết" rows={3} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="assignee">Người được giao</Label>
                                        <Select defaultValue="user1">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn người thực hiện" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user1">Nguyễn Văn A</SelectItem>
                                                <SelectItem value="user2">Trần Thị B</SelectItem>
                                                <SelectItem value="user3">Lê Văn C</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="priority">Mức độ ưu tiên</Label>
                                        <Select defaultValue="medium">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn mức độ ưu tiên" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Thấp</SelectItem>
                                                <SelectItem value="medium">Trung bình</SelectItem>
                                                <SelectItem value="high">Cao</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Trạng thái</Label>
                                        <Select defaultValue="pending">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                                <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                                                <SelectItem value="completed">Hoàn thành</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="dueDate">Hạn hoàn thành</Label>
                                        <Input id="dueDate" type="date" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        handleAddTask({
                                            title: (document.getElementById("title") as HTMLInputElement)?.value || "",
                                            description: (document.getElementById("description") as HTMLTextAreaElement)?.value || "",
                                            dueDate: (document.getElementById("dueDate") as HTMLInputElement)?.value || "",
                                        });
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Tạo nhiệm vụ
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <p className="text-gray-500">Không tìm thấy nhiệm vụ nào phù hợp với bộ lọc.</p>
                </div>
            ) : (
                <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tiêu đề
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người được giao
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ưu tiên
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hạn hoàn thành
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{task.title}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {task.description}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{task.assigneeName}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getStatusBadge(task.status)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getPriorityBadge(task.priority)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(task.dueDate)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingTask(task);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Chi tiết
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Task Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Chi tiết nhiệm vụ</DialogTitle>
                    </DialogHeader>
                    {editingTask && (
                        <div className="space-y-4">
                            <div className="grid gap-4 py-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-title">Tiêu đề</Label>
                                    <Input
                                        id="edit-title"
                                        defaultValue={editingTask.title}
                                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-description">Mô tả</Label>
                                    <Textarea
                                        id="edit-description"
                                        rows={3}
                                        defaultValue={editingTask.description}
                                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-assignee">Người được giao</Label>
                                        <Select
                                            defaultValue={editingTask.assignedTo}
                                            onValueChange={(value) => {
                                                const assigneeName =
                                                    value === "user1" ? "Nguyễn Văn A" :
                                                        value === "user2" ? "Trần Thị B" : "Lê Văn C";
                                                setEditingTask({
                                                    ...editingTask,
                                                    assignedTo: value,
                                                    assigneeName
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn người thực hiện" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user1">Nguyễn Văn A</SelectItem>
                                                <SelectItem value="user2">Trần Thị B</SelectItem>
                                                <SelectItem value="user3">Lê Văn C</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-priority">Mức độ ưu tiên</Label>
                                        <Select
                                            defaultValue={editingTask.priority}
                                            onValueChange={(value) => setEditingTask({
                                                ...editingTask,
                                                priority: value as Task['priority']
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn mức độ ưu tiên" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Thấp</SelectItem>
                                                <SelectItem value="medium">Trung bình</SelectItem>
                                                <SelectItem value="high">Cao</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-status">Trạng thái</Label>
                                        <Select
                                            defaultValue={editingTask.status}
                                            onValueChange={(value) => setEditingTask({
                                                ...editingTask,
                                                status: value as Task['status']
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                                <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                                                <SelectItem value="completed">Hoàn thành</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-dueDate">Hạn hoàn thành</Label>
                                        <Input
                                            id="edit-dueDate"
                                            type="date"
                                            defaultValue={editingTask.dueDate}
                                            onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                                        />
                                    </div>
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
                                        handleUpdateTask(editingTask);
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
