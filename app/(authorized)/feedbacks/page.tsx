"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Search, ListFilter, Eye, MoreHorizontal } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Breadcrumb,
} from "@/components/ui/breadcrumb";
import useDebounce from "@/hooks/useDebounce";
import { fetchApi } from "../../../lib/api/api-helper";

// Define Feedback type
type Feedback = {
    id: number;
    customerName: string;
    email: string;
    phone: string;
    content: string;
    rating: number;
    status: "new" | "read" | "responded";
    createdAt: string;
};

// Status mapping for display
const statusDisplayMap = {
    new: { label: "Mới", color: "bg-blue-100 text-blue-800" },
    read: { label: "Đã đọc", color: "bg-green-100 text-green-800" },
    responded: { label: "Đã phản hồi", color: "bg-purple-100 text-purple-800" },
};

type FilterStatus = "all" | "new" | "read" | "responded";

// Mock API function to fetch feedbacks
const fetchFeedbacks = async (
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
    status?: string
): Promise<{ data: Feedback[], total: number }> => {
    try {
        const response = await fetchApi(`/Feedback/Search?pageIndex=${page}&pageSize=${limit}`);

        return response;

    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        throw error;
    }
};

const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);
    const [counts, setCounts] = useState({
        all: 0,
        new: 0,
        read: 0,
        responded: 0
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Function to update counts
    const updateCounts = useCallback(async () => {
        try {
            // In a real app, you might have a separate API endpoint for counts
            // For demo, we'll fetch all items and count them
            const allFeedbacks = await fetchFeedbacks("", 1, 1000);
            
            const newCount = allFeedbacks.data.filter(f => f.status === "new").length;
            const readCount = allFeedbacks.data.filter(f => f.status === "read").length;
            const respondedCount = allFeedbacks.data.filter(f => f.status === "responded").length;
            
            setCounts({
                all: allFeedbacks.total,
                new: newCount,
                read: readCount,
                responded: respondedCount
            });
        } catch (err) {
            console.error("Failed to fetch counts:", err);
        }
    }, []);

    const loadFeedbacks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const status = filterStatus !== "all" ? filterStatus : undefined;
            const result = await fetchFeedbacks(debouncedSearchTerm, currentPage, itemsPerPage, status);
            setFeedbacks(result.data);
            setTotalItems(result.total);
            
            // Update counts whenever we load feedbacks
            await updateCounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu phản hồi");
            setFeedbacks([]);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, filterStatus, currentPage, itemsPerPage, updateCounts]);

    useEffect(() => {
        loadFeedbacks();
    }, [loadFeedbacks]);

    // Reset to page 1 when search term or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterStatus]);

    const handleViewDetails = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setIsDetailModalOpen(true);
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            // In a real app, you would call an API here
            // await markFeedbackAsRead(id);

            // For demo, we'll update the local state
            setFeedbacks(prev =>
                prev.map(feedback =>
                    feedback.id === id ? { ...feedback, status: "read" } : feedback
                )
            );

            // If the selected feedback is being updated, update it too
            if (selectedFeedback && selectedFeedback.id === id) {
                setSelectedFeedback({ ...selectedFeedback, status: "read" });
            }

            // Update counts after marking as read
            await updateCounts();

            toast.success("Đã đánh dấu phản hồi là đã đọc");
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái phản hồi");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Map filter status to display text
    const filterDisplayMap = {
        all: `Tất cả phản hồi (${counts.all})`,
        new: `Mới (${counts.new})`,
        read: `Đã đọc (${counts.read})`,
        responded: `Đã phản hồi (${counts.responded})`,
    };

    return (
        <div className="container mx-auto py-6 space-y-4 md:space-y-6">
            {/* Header & Breadcrumbs */}
            <Breadcrumb
                items={[
                    { label: "Trang chủ", href: "/dashboard" },
                    { label: "Quản lý phản hồi" }
                ]}
            />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 px-1">
                Quản lý phản hồi khách hàng
            </h1>

            {/* Filters and Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 px-1">
                {/* Search */}
                <div className="w-full md:w-auto md:flex-grow lg:max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên/email/số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs h-9 pl-9"
                    />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                                <ListFilter className="w-4 h-4 mr-2" />
                                Lọc: {filterDisplayMap[filterStatus]}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                                value={filterStatus}
                                onValueChange={(value) => setFilterStatus(value as FilterStatus)}
                            >
                                <DropdownMenuRadioItem value="all">
                                    Tất cả phản hồi ({counts.all})
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="new">
                                    Mới ({counts.new})
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="read">
                                    Đã đọc ({counts.read})
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="responded">
                                    Đã phản hồi ({counts.responded})
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table Area */}
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-white">
                {isLoading && <div className="p-6 text-center">Đang tải dữ liệu phản hồi...</div>}
                {error && (
                    <div className="p-6 text-center text-red-500">Lỗi: {error}</div>
                )}
                {!isLoading && !error && (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Khách hàng</TableHead>
                                        <TableHead className="whitespace-nowrap">Nội dung phản hồi</TableHead>
                                        <TableHead className="whitespace-nowrap">Đánh giá</TableHead>
                                        <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                                        <TableHead className="whitespace-nowrap">Ngày tạo</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedbacks.length > 0 ? (
                                        feedbacks.map((feedback) => (
                                            <TableRow key={feedback.id}>
                                                <TableCell>
                                                    <div className="font-medium">{feedback.customerName}</div>
                                                    <div className="text-sm text-gray-500">{feedback.email}</div>
                                                    <div className="text-sm text-gray-500">{feedback.phone}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs truncate">{feedback.content}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={`text-lg ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusDisplayMap[feedback.status].color}>
                                                        {statusDisplayMap[feedback.status].label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {formatDate(feedback.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full">
                                                                <span className="sr-only">Mở menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 rounded-md shadow-md">
                                                            <DropdownMenuItem
                                                                className="cursor-pointer hover:bg-slate-50"
                                                                onClick={() => handleViewDetails(feedback)}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                                Xem chi tiết
                                                            </DropdownMenuItem>
                                                            {feedback.status === "new" && (
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer hover:bg-slate-50"
                                                                    onClick={() => handleMarkAsRead(feedback.id)}
                                                                >
                                                                    <svg className="mr-2 h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm1-5.15c0 .34-.28.61-.62.61h-.76c-.34 0-.62-.27-.62-.61V8.85c0-.34.28-.61.62-.61h.76c.34 0 .62.27.62.61z" />
                                                                    </svg>
                                                                    Đánh dấu đã đọc
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                Không tìm thấy phản hồi nào.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between space-x-2 p-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                {totalItems > 0 ? (
                                    `Hiển thị ${startItem}-${endItem} trong số ${totalItems} phản hồi`
                                ) : (
                                    "Không có phản hồi nào"
                                )}
                            </div>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage <= 1}
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage >= totalPages}
                                >
                                    Tiếp
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Feedback Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Chi tiết phản hồi</DialogTitle>
                    </DialogHeader>
                    {selectedFeedback && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Khách hàng</h3>
                                    <p className="mt-1">{selectedFeedback.customerName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Đánh giá</h3>
                                    <div className="flex mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-lg ${i < selectedFeedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p className="mt-1">{selectedFeedback.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Số điện thoại</h3>
                                    <p className="mt-1">{selectedFeedback.phone}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Ngày tạo</h3>
                                    <p className="mt-1">{formatDate(selectedFeedback.createdAt)}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                                    <Badge className={`mt-1 ${statusDisplayMap[selectedFeedback.status].color}`}>
                                        {statusDisplayMap[selectedFeedback.status].label}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Nội dung phản hồi</h3>
                                <p className="mt-1 whitespace-pre-wrap">{selectedFeedback.content}</p>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                {selectedFeedback.status === "new" && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            handleMarkAsRead(selectedFeedback.id);
                                            setIsDetailModalOpen(false);
                                        }}
                                    >
                                        Đánh dấu đã đọc
                                    </Button>
                                )}
                                <Button
                                    onClick={() => setIsDetailModalOpen(false)}
                                >
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default FeedbackPage;