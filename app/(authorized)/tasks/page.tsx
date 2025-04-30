"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, RefreshCw, CheckCircle2, Clock, AlertCircle, Eye, Edit2, CalendarDays, User, FileBadge, CornerDownRight, MoreVertical, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useDebounce from "@/hooks/useDebounce";
import { fetchApi } from "@/lib/api/api-helper";
import { AddTaskPayload, Task, UpdateTaskPayload } from "@/types/taskEach";
import { Staff } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterStatus = "All" | "Pending" | "InProgress" | "Completed";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [counts, setCounts] = useState({
        all: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
    });
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isStaffLoading, setIsStaffLoading] = useState(false);
    const [dateError, setDateError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<{
        title?: string;
        description?: string;
    }>({});

    // State cho form thêm mới nhiệm vụ
    const [newTask, setNewTask] = useState<Partial<Task>>({
        title: "",
        description: "",
        assignedToId: undefined,
        assigneeName: "",
        priority: "Medium",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filterDisplayMap: Record<FilterStatus, string> = {
        All: "Tất cả nhiệm vụ",
        Pending: "Chờ xử lý",
        InProgress: "Đang thực hiện",
        Completed: "Hoàn thành",
    };

    // Fetch tasks data
    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Gọi API thực tế để lấy danh sách nhiệm vụ
            const response = await fetchApi('/taskEach/search', {
                method: 'POST',
                body: JSON.stringify({
                    searchTerm: debouncedSearchTerm,
                    status: filterStatus !== "All" ? filterStatus : undefined
                })
            });
            if (Array.isArray(response)) {
                setTasks(response);

                // Cập nhật số lượng cho từng trạng thái
                setCounts({
                    all: response.length,
                    pending: response.filter(task => task.status === "Pending").length,
                    inProgress: response.filter(task => task.status === "InProgress").length,
                    completed: response.filter(task => task.status === "Completed").length,
                });
            } else {
                throw new Error('Invalid data format received from API');
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err instanceof Error ? err.message : "Failed to fetch tasks");
            toast.error("Không thể tải danh sách nhiệm vụ");
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, filterStatus]);

    // Fetch staff list
    const fetchStaffList = useCallback(async () => {
        setIsStaffLoading(true);
        try {
            const response = await fetchApi('/Staff/GetAll', {
                method: 'GET'
            });

            if (Array.isArray(response)) {
                setStaffList(response);
                console.log("Staff list:", response);
            } else {
                console.error('Invalid staff data format received from API');
            }
        } catch (err) {
            console.error('Error fetching staff list:', err);
            toast.error("Không thể tải danh sách nhân viên");
        } finally {
            setIsStaffLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        fetchStaffList();
    }, [fetchTasks, fetchStaffList]);

    // Filter tasks based on status
    const filteredTasks = useMemo(() => {
        if (filterStatus === "All") {
            return tasks.filter(task =>
                task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                task.assigneeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        return tasks.filter(task => {
            const matchesSearch =
                task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                task.assigneeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

            return matchesSearch && task.status === filterStatus;
        });
    }, [tasks, filterStatus, debouncedSearchTerm]);

    const refreshData = useCallback(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Hàm kiểm tra thời gian hợp lệ
    const validateDates = (startDate: string, endDate: string): boolean => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            setDateError("Ngày kết thúc phải sau ngày bắt đầu");
            return false;
        }

        setDateError(null);
        return true;
    };

    // Validate form fields
    const validateForm = (data: Partial<Task>): boolean => {
        const errors: {
            title?: string;
            description?: string;
        } = {};
        
        // Validate title
        if (!data.title || data.title.trim() === '') {
            errors.title = "Tiêu đề không được để trống";
        }
        
        // Validate description
        if (!data.description || data.description.trim() === '') {
            errors.description = "Mô tả không được để trống";
        }
        
        setFormErrors(errors);
        
        // Form is valid if there are no errors
        return Object.keys(errors).length === 0;
    };

    // Handle adding a new task
    const handleAddTask = async () => {
        try {
            // Validate form
            if (!validateForm(newTask)) {
                return;
            }
            
            // Check if assignedToId is set
            if (!newTask.assignedToId) {
                toast.error("Vui lòng chọn người thực hiện");
                return;
            }
            
            // Validate dates
            if (!validateDates(newTask.startDate || "", newTask.endDate || "")) {
                return;
            }

            const payload: AddTaskPayload = {
                title: newTask.title || "",
                description: newTask.description || "",
                assignedToId: newTask.assignedToId,
                priority: newTask.priority as Task["priority"] || "Medium",
                startDate: new Date(newTask.startDate || new Date().toISOString().split('T')[0]),
                endDate: new Date(newTask.endDate || new Date().toISOString().split('T')[0]),
            }

            // Call API to add task
            const response = await fetchApi("/TaskEach/Add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response) {
                toast.success("Nhiệm vụ đã được tạo thành công");
                // Refresh task list
                fetchTasks();
            } else {
                toast.error("Không thể tạo nhiệm vụ");
            }

            setIsAddModalOpen(false);

            // Reset form
            setNewTask({
                title: "",
                description: "",
                assignedToId: undefined,
                priority: "Medium",
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            toast.error("Lỗi khi tạo nhiệm vụ: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    };

    // Handle updating a task
    const handleUpdateTask = async (taskData: Task) => {
        try {
            // Validate form
            if (!validateForm(taskData)) {
                return;
            }
            
            // Check if assignedToId is set
            if (!taskData.assignedToId) {
                toast.error("Vui lòng chọn người thực hiện");
                return;
            }

            // Validate dates
            if (!validateDates(taskData.startDate || "", taskData.endDate || "")) {
                return;
            }

            // Format dates properly and log for verification
            const formattedStartDate = new Date(taskData.startDate);
            const formattedEndDate = new Date(taskData.endDate);
            
            console.log("Date format check - Original:", {
                startDate: taskData.startDate,
                endDate: taskData.endDate
            });
            console.log("Date format check - Formatted:", {
                startDate: formattedStartDate,
                endDate: formattedEndDate
            });
            
            const payload: UpdateTaskPayload = {
                taskEachId: taskData.taskEachId,
                title: taskData.title,
                description: taskData.description || "",
                assignedToId: taskData.assignedToId,
                priority: taskData.priority,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
            };

            console.log("Update payload:", payload); // Debug log

            // Call API to update task
            const response = await fetchApi(`/TaskEach/Update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response) {
                toast.success("Nhiệm vụ đã được cập nhật thành công");
                // Refresh task list
                fetchTasks();
            } else {
                toast.error("Không thể cập nhật nhiệm vụ");
            }

            setIsEditModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            console.error("Error updating task:", err);
            toast.error("Lỗi khi cập nhật nhiệm vụ: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    };

    // Format date for input type="date" (YYYY-MM-DD)
    const formatDateInput = (dateString: string) => {
        if (!dateString) return "";
        
        try {
            // Check if the date is in dd/MM/yyyy format
            if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                const [day, month, year] = dateString.split('/').map(Number);
                // Fix timezone issue by using direct date construction with local time
                return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
            
            // Handle standard date format
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            // Fix timezone issue by extracting date parts directly
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error("Error formatting date for input:", error);
            return dateString;
        }
    };
    
    // Format date for display as dd/MM/yyyy
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        
        try {
            // Check if already in dd/MM/yyyy format
            if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                return dateString;
            }
            
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            // Format as dd/MM/yyyy
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error("Error formatting date for display:", error);
            return dateString;
        }
    };

    // Get status badge
    const getStatusBadge = (status: Task['status']) => {
        switch (status) {
            case 'Pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="w-3 h-3 mr-1" /> Chờ xử lý
                </Badge>;
            case 'InProgress':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <AlertCircle className="w-3 h-3 mr-1" /> Đang thực hiện
                </Badge>;
            case 'Completed':
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
            case 'Low':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Thấp</Badge>;
            case 'Medium':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Trung bình</Badge>;
            case 'High':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cao</Badge>;
            default:
                return null;
        }
    };

    // Debug effect for editingTask date values
    useEffect(() => {
        if (editingTask) {
            console.log("Editing task dates:", {
                startDate: editingTask.startDate,
                endDate: editingTask.endDate,
                formattedStartDate: formatDateInput(editingTask.startDate),
                formattedEndDate: formatDateInput(editingTask.endDate)
            });
        }
    }, [editingTask]);

    // Handle deleting a task
    const handleDeleteTask = async (taskId: number) => {
        if (!taskId) return;
        
        setIsDeleting(true);
        try {
            // Call API to delete task
            await fetchApi(`/TaskEach/${taskId}`, {
                method: "DELETE",
            });
            
            toast.success("Nhiệm vụ đã được xóa thành công");
            // Refresh task list
            fetchTasks();
            
            setIsDeleteModalOpen(false);
            setDeletingTask(null);
        } catch (err) {
            console.error("Error deleting task:", err);
            toast.error("Lỗi khi xóa nhiệm vụ: " + (err instanceof Error ? err.message : "Unknown error"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Breadcrumb
                items={[
                    { label: "Trang chủ", href: "/dashboard" },
                    { label: "Quản lý nhiệm vụ" }
                ]}
            />

            {/* Unified container with white background */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {/* Header section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Quản lý nhiệm vụ
                    </h1>
                </div>

                {/* Search section */}
                <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm nhiệm vụ/người được giao..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 pl-9 pr-4 w-full"
                            />
                        </div>
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Thêm nhiệm vụ
                        </Button>
                    </div>
                </div>

                {/* Gmail-style tabs - directly above the table with no gap */}
                <div className="border-b border-gray-200">
                    <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)} className="w-full">
                        <TabsList className="h-12 bg-transparent p-0 flex w-full justify-start rounded-none border-0">
                            <TabsTrigger
                                key="All"
                                value="All"
                                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                            >
                                Tất cả ({counts.all})
                            </TabsTrigger>
                            <TabsTrigger
                                key="Pending"
                                value="Pending"
                                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                            >
                                Chờ xử lý ({counts.pending})
                            </TabsTrigger>
                            <TabsTrigger
                                key="InProgress"
                                value="InProgress"
                                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                            >
                                Đang thực hiện ({counts.inProgress})
                            </TabsTrigger>
                            <TabsTrigger
                                key="Completed"
                                value="Completed"
                                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                            >
                                Hoàn thành ({counts.completed})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Table area - no padding to connect directly with tabs */}
                <div className="pb-0">
                    {isLoading && (
                        <div className="p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                            <p className="mt-2 text-gray-500">Đang tải dữ liệu nhiệm vụ...</p>
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
                    {!isLoading && !error && filteredTasks.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                <span className="text-gray-500 text-xl">!</span>
                            </div>
                            <p className="text-gray-500">Không tìm thấy nhiệm vụ nào</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {searchTerm ? "Hãy điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc" : "Thêm nhiệm vụ mới để bắt đầu"}
                            </p>
                            {searchTerm && (
                                <Button onClick={() => setSearchTerm("")} variant="outline" className="mt-4">
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    )}
                    {!isLoading && !error && filteredTasks.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Tiêu đề
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Nhân viên xử lý
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Ưu tiên
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Thời gian
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.map((task) => (
                                        <tr key={task.taskEachId} className="border-b hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{task.title}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {task.description}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900">{task.assigneeName}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(task.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getPriorityBadge(task.priority)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                <div>{task.startDate} - {task.endDate}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Mở menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setViewingTask(task);
                                                                setIsViewModalOpen(true);
                                                            }}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Xem chi tiết
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                // Make sure to format dates correctly when setting the editing task
                                                                const taskForEdit = {
                                                                    ...task,
                                                                    startDate: task.startDate || new Date().toISOString().split('T')[0],
                                                                    endDate: task.endDate || new Date().toISOString().split('T')[0]
                                                                };
                                                                setEditingTask(taskForEdit);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Edit2 className="h-4 w-4 mr-2" />
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="flex items-center cursor-pointer text-red-600 hover:text-red-800 focus:text-red-800"
                                                            onClick={() => {
                                                                setDeletingTask(task);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add Task Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Thêm nhiệm vụ mới</DialogTitle>
                            <DialogDescription>
                                Tạo một nhiệm vụ mới và gán cho một thành viên trong nhóm.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Tiêu đề nhiệm vụ */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-medium">
                                    Tiêu đề nhiệm vụ <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    id="title" 
                                    placeholder="Nhập tiêu đề nhiệm vụ"
                                    className={`w-full ${formErrors.title ? "border-red-500" : ""}`}
                                    value={newTask.title}
                                    onChange={(e) => {
                                        setNewTask({ ...newTask, title: e.target.value });
                                        // Clear error when user types
                                        if (formErrors.title && e.target.value.trim() !== '') {
                                            setFormErrors({...formErrors, title: undefined});
                                        }
                                    }}
                                />
                                {formErrors.title && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                                )}
                            </div>

                            {/* Mô tả nhiệm vụ */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">
                                    Mô tả chi tiết <span className="text-red-500">*</span>
                                </Label>
                                <Textarea 
                                    id="description" 
                                    placeholder="Nhập mô tả chi tiết cho nhiệm vụ" 
                                    className={`w-full min-h-[100px] resize-y ${formErrors.description ? "border-red-500" : ""}`}
                                    rows={4}
                                    value={newTask.description}
                                    onChange={(e) => {
                                        setNewTask({ ...newTask, description: e.target.value });
                                        // Clear error when user types
                                        if (formErrors.description && e.target.value.trim() !== '') {
                                            setFormErrors({...formErrors, description: undefined});
                                        }
                                    }}
                                />
                                {formErrors.description && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                                )}
                            </div>

                            {/* Thông tin phân công và thời gian */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Người được giao */}
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label htmlFor="assignee" className="text-sm font-medium">
                                        Người thực hiện <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={newTask.assignedToId?.toString() || ""}
                                        onValueChange={(value) => {
                                            const assigneeId = parseInt(value, 10);
                                            const staff = staffList.find(s => s.staffId === assigneeId);
                                            console.log("Selected staff:", staff);
                                            setNewTask({
                                                ...newTask,
                                                assignedToId: assigneeId
                                            });
                                        }}
                                    >
                                        <SelectTrigger id="assignee" className="w-full">
                                            <SelectValue placeholder="Chọn người thực hiện" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Người thực hiện</SelectLabel>
                                                {isStaffLoading ? (
                                                    <SelectItem value="loading" disabled>
                                                        Đang tải danh sách...
                                                    </SelectItem>
                                                ) : staffList.length > 0 ? (
                                                    staffList.map(staff => (
                                                        <SelectItem key={staff.staffId} value={staff.staffId.toString()}>
                                                            {staff.staffId} - {staff.fullName}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="empty" disabled>
                                                        Không có nhân viên
                                                    </SelectItem>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Mức độ ưu tiên */}
                                <div className="space-y-2 col-span-1">
                                    <Label htmlFor="priority" className="text-sm font-medium">
                                        Mức độ ưu tiên
                                    </Label>
                                    <Select
                                        value={newTask.priority}
                                        onValueChange={(value) => setNewTask({
                                            ...newTask,
                                            priority: value as Task['priority']
                                        })}
                                    >
                                        <SelectTrigger id="priority" className="w-full">
                                            <SelectValue placeholder="Chọn mức độ ưu tiên" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Mức độ ưu tiên</SelectLabel>
                                                <SelectItem key="Low" value="Low">Thấp</SelectItem>
                                                <SelectItem key="Medium" value="Medium">Trung bình</SelectItem>
                                                <SelectItem key="High" value="High">Cao</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Thời gian */}
                                <div className="space-y-2 col-span-1">
                                    <Label htmlFor="startDate" className="text-sm font-medium">Ngày bắt đầu</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        className="w-full"
                                        value={newTask.startDate}
                                        onChange={(e) => {
                                            setNewTask({ ...newTask, startDate: e.target.value });
                                            if (newTask.endDate) {
                                                validateDates(e.target.value, newTask.endDate);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2 col-span-1">
                                    <Label htmlFor="endDate" className="text-sm font-medium">Ngày kết thúc</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        className={`w-full ${dateError ? "border-red-500" : ""}`}
                                        value={newTask.endDate}
                                        min={newTask.startDate}
                                        onChange={(e) => {
                                            setNewTask({ ...newTask, endDate: e.target.value });
                                            if (newTask.startDate) {
                                                validateDates(newTask.startDate, e.target.value);
                                            }
                                        }}
                                    />
                                    {dateError && (
                                        <p className="text-red-500 text-xs mt-1">{dateError}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                className="mt-2 sm:mt-0"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleAddTask}
                                className="mt-2 sm:mt-0"
                            >
                                Tạo nhiệm vụ
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Task Dialog */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa nhiệm vụ</DialogTitle>
                            <DialogDescription>
                                Cập nhật thông tin nhiệm vụ
                            </DialogDescription>
                        </DialogHeader>
                        {editingTask && (
                            <>
                                {/* Console log placed in useEffect instead of directly in JSX */}
                                <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                    {/* Tiêu đề nhiệm vụ */}
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-title" className="text-sm font-medium">
                                            Tiêu đề nhiệm vụ <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="edit-title"
                                            className={`w-full ${formErrors.title ? "border-red-500" : ""}`}
                                            value={editingTask.title}
                                            onChange={(e) => {
                                                setEditingTask(prev => {
                                                    if (!prev) return prev;
                                                    return {...prev, title: e.target.value};
                                                });
                                                // Clear error when user types
                                                if (formErrors.title && e.target.value.trim() !== '') {
                                                    setFormErrors({...formErrors, title: undefined});
                                                }
                                            }}
                                        />
                                        {formErrors.title && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                                        )}
                                    </div>

                                    {/* Mô tả nhiệm vụ */}
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-description" className="text-sm font-medium">
                                            Mô tả chi tiết <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="edit-description"
                                            className={`w-full min-h-[100px] resize-y ${formErrors.description ? "border-red-500" : ""}`}
                                            rows={4}
                                            value={editingTask.description}
                                            onChange={(e) => {
                                                setEditingTask(prev => {
                                                    if (!prev) return prev;
                                                    return {...prev, description: e.target.value};
                                                });
                                                // Clear error when user types
                                                if (formErrors.description && e.target.value.trim() !== '') {
                                                    setFormErrors({...formErrors, description: undefined});
                                                }
                                            }}
                                        />
                                        {formErrors.description && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                                        )}
                                    </div>

                                    {/* Thông tin phân công và thời gian */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Người được giao */}
                                        <div className="space-y-2 col-span-1 md:col-span-2">
                                            <Label htmlFor="edit-assignee" className="text-sm font-medium">
                                                Người thực hiện <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                defaultValue={editingTask.assignedToId?.toString() || ""}
                                                onValueChange={(value) => {
                                                    const assigneeId = parseInt(value, 10);
                                                    const staff = staffList.find(s => s.staffId === assigneeId);
                                                    console.log("Selected staff for edit:", staff);
                                                    setEditingTask({
                                                        ...editingTask,
                                                        assignedToId: assigneeId
                                                    });
                                                }}
                                            >
                                                <SelectTrigger id="edit-assignee" className="w-full">
                                                    <SelectValue placeholder="Chọn người thực hiện" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Người thực hiện</SelectLabel>
                                                        {isStaffLoading ? (
                                                            <SelectItem value="loading" disabled>
                                                                Đang tải danh sách...
                                                            </SelectItem>
                                                        ) : staffList.length > 0 ? (
                                                            staffList.map(staff => (
                                                                <SelectItem key={staff.staffId} value={staff.staffId.toString()}>
                                                                    {staff.staffId} - {staff.fullName}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="empty" disabled>
                                                                Không có nhân viên
                                                            </SelectItem>
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Mức độ ưu tiên */}
                                        <div className="space-y-2 col-span-1">
                                            <Label htmlFor="edit-priority" className="text-sm font-medium">
                                                Mức độ ưu tiên
                                            </Label>
                                            <Select
                                                defaultValue={editingTask.priority}
                                                onValueChange={(value) => setEditingTask({
                                                    ...editingTask,
                                                    priority: value as Task['priority']
                                                })}
                                            >
                                                <SelectTrigger id="edit-priority" className="w-full">
                                                    <SelectValue placeholder="Chọn mức độ ưu tiên" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Mức độ ưu tiên</SelectLabel>
                                                        <SelectItem key="Low" value="Low">Thấp</SelectItem>
                                                        <SelectItem key="Medium" value="Medium">Trung bình</SelectItem>
                                                        <SelectItem key="High" value="High">Cao</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Thời gian */}
                                        <div className="space-y-2 col-span-1">
                                            <Label htmlFor="edit-startDate" className="text-sm font-medium">
                                                Ngày bắt đầu
                                            </Label>
                                            <Input
                                                id="edit-startDate"
                                                type="date"
                                                className="w-full"
                                                value={formatDateInput(editingTask.startDate)}
                                                onChange={(e) => {
                                                    const newDate = e.target.value;
                                                    console.log("Setting new start date:", newDate);
                                                    setEditingTask(prev => {
                                                        if (!prev) return prev;
                                                        return {
                                                            ...prev,
                                                            startDate: newDate
                                                        };
                                                    });
                                                    if (editingTask.endDate) {
                                                        validateDates(newDate, editingTask.endDate);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-1">
                                            <Label htmlFor="edit-endDate" className="text-sm font-medium">
                                                Ngày kết thúc
                                            </Label>
                                            <Input
                                                id="edit-endDate"
                                                type="date"
                                                className={`w-full ${dateError ? "border-red-500" : ""}`}
                                                value={formatDateInput(editingTask.endDate)}
                                                min={formatDateInput(editingTask.startDate)}
                                                onChange={(e) => {
                                                    const newDate = e.target.value;
                                                    console.log("Setting new end date:", newDate);
                                                    setEditingTask(prev => {
                                                        if (!prev) return prev;
                                                        return {
                                                            ...prev,
                                                            endDate: newDate
                                                        };
                                                    });
                                                    if (editingTask.startDate) {
                                                        validateDates(editingTask.startDate, newDate);
                                                    }
                                                }}
                                                // Format display as dd/MM/yyyy but keep ISO format for value
                                                data-date-format="DD/MM/YYYY"
                                            />
                                            {dateError && (
                                                <p className="text-red-500 text-xs mt-1">{dateError}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="mt-2 sm:mt-0"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={() => handleUpdateTask(editingTask)}
                                        className="mt-2 sm:mt-0"
                                    >
                                        Cập nhật
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* View Task Detail Dialog */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold flex items-center">
                                Chi tiết nhiệm vụ
                            </DialogTitle>
                            <DialogDescription>
                                Xem thông tin chi tiết về nhiệm vụ
                            </DialogDescription>
                        </DialogHeader>
                        {viewingTask && (
                            <div className="py-4 space-y-6">
                                {/* Task title */}
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">{viewingTask.title}</h3>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(viewingTask.status)}
                                        {getPriorityBadge(viewingTask.priority)}
                                    </div>
                                </div>
                                
                                {/* Task details in grid layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-gray-50">
                                    {/* Assigned to */}
                                    <div className="flex items-start gap-2">
                                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Người thực hiện</p>
                                            <p className="text-sm">{viewingTask.assigneeName || "Chưa phân công"}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Date range */}
                                    <div className="flex items-start gap-2">
                                        <CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Thời gian</p>
                                            <p className="text-sm">
                                                {formatDate(viewingTask.startDate)} - {formatDate(viewingTask.endDate)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Task ID */}
                                    <div className="flex items-start gap-2">
                                        <FileBadge className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Mã nhiệm vụ</p>
                                            <p className="text-sm font-mono">#{viewingTask.taskEachId}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Description */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Mô tả chi tiết</h4>
                                    <div className="p-4 border rounded-lg bg-white">
                                        {viewingTask.description ? (
                                            <div className="whitespace-pre-wrap text-sm text-gray-700">
                                                {viewingTask.description}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">Không có mô tả chi tiết</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Activity log - Placeholder for future implementation */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500 flex items-center">
                                        <CornerDownRight className="h-4 w-4 mr-1" />
                                        Lịch sử hoạt động
                                    </h4>
                                    <div className="p-4 border rounded-lg bg-white text-sm text-gray-400 italic">
                                        Chức năng này sẽ được cập nhật trong thời gian tới
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter className="sm:justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setIsViewModalOpen(false)}
                            >
                                Đóng
                            </Button>
                            <Button
                                onClick={() => {
                                    if (viewingTask) {
                                        // Make sure to format dates correctly when setting the editing task
                                        const taskForEdit = {
                                            ...viewingTask,
                                            startDate: viewingTask.startDate || new Date().toISOString().split('T')[0],
                                            endDate: viewingTask.endDate || new Date().toISOString().split('T')[0]
                                        };
                                        setEditingTask(taskForEdit);
                                        setIsViewModalOpen(false);
                                        setIsEditModalOpen(true);
                                    }
                                }}
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Task Confirmation Dialog */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold flex items-center text-red-600">
                                <Trash2 className="h-5 w-5 mr-2" />
                                Xác nhận xóa nhiệm vụ
                            </DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn muốn xóa nhiệm vụ này? Hành động này không thể hoàn tác.
                            </DialogDescription>
                        </DialogHeader>
                        {deletingTask && (
                            <div className="py-4">
                                <div className="p-4 border rounded-lg bg-gray-50 mb-4">
                                    <h3 className="font-medium">{deletingTask.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        {getStatusBadge(deletingTask.status)}
                                        <span className="text-sm text-gray-500">•</span>
                                        <span className="text-sm text-gray-500">
                                            #{deletingTask.taskEachId}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Xóa nhiệm vụ sẽ xóa tất cả thông tin liên quan đến nhiệm vụ này.
                                </p>
                            </div>
                        )}
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deletingTask && handleDeleteTask(Number(deletingTask.taskEachId))}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                                        Đang xóa...
                                    </>
                                ) : (
                                    "Xác nhận xóa"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
