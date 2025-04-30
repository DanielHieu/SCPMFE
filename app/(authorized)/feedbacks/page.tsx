"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, Eye, MoreHorizontal, MessageSquare } from "lucide-react";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Breadcrumb,
} from "@/components/ui/breadcrumb";
import { Textarea } from "@/components/ui/textarea";
import useDebounce from "@/hooks/useDebounce";
import { fetchApi } from "@/lib/api/api-helper";
import { Feedback, FeedbackStatus } from "@/types/feedback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

// Function to get status style and label
const getStatusStyle = (status: string) => {
    switch (status) {
        case "New":
            return { label: "Mới", color: "bg-blue-100 text-blue-800" };
        case "Viewed":
            return { label: "Đã đọc", color: "bg-green-100 text-green-800" };
        case "Responsed":
            return { label: "Đã phản hồi", color: "bg-purple-100 text-purple-800" };
        default:
            return { label: "Không xác định", color: "bg-gray-100 text-gray-800" };
    }
};

type FilterStatus = "All" | "New" | "Viewed" | "Responsed";

// API function to fetch feedbacks
const fetchFeedbacks = async (
    page: number = 1,
    limit: number = 10,
    searchTerm: string = "",
    status: string = "All"
): Promise<{ items: Feedback[], totalCount: number }> => {
    try {
        let url = `/Feedback/Search`;

        const response = await fetchApi(url, {
            method: "POSt",
            body: JSON.stringify({
                pageIndex: page,
                pageSize: limit,
                keyword: searchTerm,
                status: status
            })
        });
        return response;
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        throw error;
    }
};

// API function to mark feedback as read
const markFeedbackAsRead = async (id: number): Promise<void> => {
    try {
        await fetchApi(`/Feedback/${id}/MarkAsRead`, {
            method: 'PUT'
        });
    } catch (error) {
        console.error('Error marking feedback as read:', error);
        throw error;
    }
};

// API function to reply to feedback
const replyToFeedback = async (id: number, content: string): Promise<void> => {
    try {
        await fetchApi(`/Feedback/${id}/Reply`, {
            method: 'POST',
            body: JSON.stringify({
                content: content
            })
        });
    } catch (error) {
        console.error('Error replying to feedback:', error);
        throw error;
    }
};

const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);
    const [counts, setCounts] = useState({
        all: 0,
        new: 0,
        viewed: 0,
        responsed: 0
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Function to update counts
    const updateCounts = useCallback(async () => {
        try {
            const allResponse = await fetchApi('/Feedback/Count');
            const newResponse = await fetchApi('/Feedback/Count?status=New');
            const viewedResponse = await fetchApi('/Feedback/Count?status=Viewed');
            const responsedResponse = await fetchApi('/Feedback/Count?status=Responsed');

            setCounts({
                all: allResponse.count || 0,
                new: newResponse.count || 0,
                viewed: viewedResponse.count || 0,
                responsed: responsedResponse.count || 0
            });
        } catch (err) {
            console.error("Failed to fetch counts:", err);
        }
    }, []);

    const loadFeedbacks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchFeedbacks(
                currentPage,
                itemsPerPage,
                debouncedSearchTerm,
                filterStatus
            );
            setFeedbacks(result.items);
            setTotalItems(result.totalCount);
            // Update counts whenever we load feedbacks
            await updateCounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu đánh giá");
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

        // If feedback is new, mark it as read automatically when viewed
        if (feedback.status === FeedbackStatus.New) {
            handleMarkAsRead(feedback.feedbackId);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await markFeedbackAsRead(id);

            // Update the local state
            setFeedbacks(prev =>
                prev.map(feedback =>
                    feedback.feedbackId === id ? { ...feedback, status: FeedbackStatus.Viewed } : feedback
                )
            );

            // If the selected feedback is being updated, update it too
            if (selectedFeedback && selectedFeedback.feedbackId === id) {
                setSelectedFeedback({ ...selectedFeedback, status: FeedbackStatus.Viewed });
            }

            // Update counts after marking as read
            await updateCounts();

            toast.success("Đã đánh dấu đánh giá là đã đọc");
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái đánh giá");
        }
    };

    const handleOpenReplyModal = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setReplyContent(feedback.responsedContent || ""); // Pre-fill with existing response if any
        setIsReplyModalOpen(true);
    };

    const handleSubmitReply = async () => {
        if (!selectedFeedback || !replyContent.trim()) return;

        setIsSubmittingReply(true);
        try {
            await replyToFeedback(selectedFeedback.feedbackId, replyContent);

            // Update local state
            const updatedFeedback = {
                ...selectedFeedback,
                status: FeedbackStatus.Responsed,
                responsedContent: replyContent,
                responsedAt: new Date().toISOString()
            };

            setFeedbacks(prev =>
                prev.map(feedback =>
                    feedback.feedbackId === selectedFeedback.feedbackId ? updatedFeedback : feedback
                )
            );

            setSelectedFeedback(updatedFeedback);

            // Update counts
            await updateCounts();

            toast.success("Phản hồi đã được gửi thành công");
            setIsReplyModalOpen(false);
        } catch (error) {
            toast.error("Không thể gửi phản hồi");
        } finally {
            setIsSubmittingReply(false);
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
        all: `Tất cả đánh giá (${counts.all})`,
        new: `Mới (${counts.new})`,
        viewed: `Đã xem (${counts.viewed})`
    };

    return (
        <>
            <div className="container mx-auto py-6 space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Trang chủ", href: "/dashboard" },
                        { label: "Quản lý đánh giá" }
                    ]}
                />

                {/* Unified container with white background */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    {/* Header section */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Quản lý đánh giá của khách hàng
                        </h1>
                    </div>

                    {/* Search section */}
                    <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tên/email/số điện thoại..."
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
                                    value="All"
                                    className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                                >
                                    Tất cả đánh giá ({counts.all})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="New"
                                    className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                                >
                                    Mới ({counts.new})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="Viewed"
                                    className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                                >
                                    Đã xem ({counts.viewed})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="Responsed"
                                    className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                                >
                                    Đã phản hồi ({counts.responsed})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Table area - no padding to connect directly with tabs */}
                    <div className="pb-0">
                        {isLoading && (
                            <div className="p-8 text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                                <p className="mt-2 text-gray-500">Đang tải dữ liệu đánh giá...</p>
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
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">Khách hàng</TableHead>
                                            <TableHead className="whitespace-nowrap">Nội dung</TableHead>
                                            <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                                            <TableHead className="whitespace-nowrap">Ngày tạo</TableHead>
                                            <TableHead className="whitespace-nowrap">Phản hồi</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {feedbacks.length > 0 ? (
                                            feedbacks.map((feedback) => (
                                                <TableRow key={feedback.feedbackId}>
                                                    <TableCell>
                                                        <div className="font-medium">{feedback.customerName}</div>
                                                        <div className="text-sm text-gray-500">{feedback.customerEmail}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-xs truncate">
                                                            {feedback.content.length > 100
                                                                ? `${feedback.content.substring(0, 100)}...`
                                                                : feedback.content}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusStyle(feedback.status).color}>
                                                            {getStatusStyle(feedback.status).label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {formatDate(feedback.createdAt)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {feedback.status === "Responsed" ? (
                                                            <span className="text-sm text-green-600">Đã phản hồi</span>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">Chưa phản hồi</span>
                                                        )}
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
                                                                {feedback.status === "New" && (
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer hover:bg-slate-50"
                                                                        onClick={() => handleMarkAsRead(feedback.feedbackId)}
                                                                    >
                                                                        <svg className="mr-2 h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm1-5.15c0 .34-.28.61-.62.61h-.76c-.34 0-.62-.27-.62-.61V8.85c0-.34.28-.61.62-.61h.76c.34 0 .62.27.62.61z" />
                                                                        </svg>
                                                                        Đánh dấu đã đọc
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {(feedback.status === "New" || feedback.status === "Viewed") && (
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer hover:bg-slate-50"
                                                                        onClick={() => handleOpenReplyModal(feedback)}
                                                                    >
                                                                        <MessageSquare className="mr-2 h-4 w-4 text-slate-500" />
                                                                        Phản hồi
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                                                    Không tìm thấy đánh giá nào
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!isLoading && !error && totalPages > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t">
                            <div className="text-sm text-gray-500">
                                Hiển thị {startItem}-{endItem} trong số {totalItems} đánh giá
                            </div>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="border-gray-200 text-gray-600"
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="border-gray-200 text-gray-600"
                                >
                                    Tiếp
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Feedback Detail Modal */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Chi tiết đánh giá</DialogTitle>
                        </DialogHeader>
                        {selectedFeedback && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Thông tin khách hàng</h3>
                                    <p className="font-medium mt-1">{selectedFeedback.customerName}</p>
                                    <p className="text-sm text-gray-500">{selectedFeedback.customerEmail}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Nội dung đánh giá</h3>
                                    <div className="bg-gray-50 p-3 rounded-md mt-1 text-sm">
                                        {selectedFeedback.content}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Ngày tạo</h3>
                                        <p className="text-sm mt-1">{formatDate(selectedFeedback.createdAt)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                                        <Badge className={`mt-1 ${getStatusStyle(selectedFeedback.status).color}`}>
                                            {getStatusStyle(selectedFeedback.status).label}
                                        </Badge>
                                    </div>
                                </div>
                                {selectedFeedback.status === "Responsed" && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Phản hồi</h3>
                                        <div className="bg-blue-50 p-3 rounded-md mt-1 text-sm">
                                            {selectedFeedback.responsedContent}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Đã phản hồi lúc: {formatDate(selectedFeedback.responsedAt || "")}
                                        </p>
                                    </div>
                                )}
                                <DialogFooter className="mt-6">
                                    {(selectedFeedback.status === "New" || selectedFeedback.status === "Viewed") && (
                                        <Button
                                            onClick={() => {
                                                setIsDetailModalOpen(false);
                                                handleOpenReplyModal(selectedFeedback);
                                            }}
                                            className="mr-2"
                                        >
                                            Phản hồi
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                                        Đóng
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Reply Modal */}
                <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Phản hồi đánh giá</DialogTitle>
                        </DialogHeader>
                        {selectedFeedback && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Khách hàng</h3>
                                    <p className="font-medium mt-1">{selectedFeedback.customerName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Nội dung đánh giá</h3>
                                    <div className="bg-gray-50 p-3 rounded-md mt-1 text-sm">
                                        {selectedFeedback.content}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="reply-content">Nội dung phản hồi</Label>
                                    <Textarea
                                        id="reply-content"
                                        placeholder="Nhập nội dung phản hồi..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        className="mt-1 min-h-[100px]"
                                    />
                                </div>
                                <DialogFooter className="mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsReplyModalOpen(false)}
                                        disabled={isSubmittingReply}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleSubmitReply}
                                        disabled={!replyContent.trim() || isSubmittingReply}
                                    >
                                        {isSubmittingReply ? "Đang gửi..." : "Gửi phản hồi"}
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

export default FeedbackPage;