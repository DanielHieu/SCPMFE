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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { getFeedbackCountStats } from "@/lib/api/feedback.api";

const ItemsPerPage = 10;

// Hàm lấy style và nhãn cho trạng thái
const getStatusStyle = (status: string) => {
    switch (status) {
        case FeedbackStatus.New:
            return { label: "Mới", color: "bg-blue-100 text-blue-800" };
        case FeedbackStatus.Viewed:
            return { label: "Đã xem", color: "bg-green-100 text-green-800" };
        case FeedbackStatus.Responsed:
            return { label: "Đã phản hồi", color: "bg-purple-100 text-purple-800" };
        default:
            return { label: "Không xác định", color: "bg-gray-100 text-gray-800" };
    }
};

type FilterStatus = "All" | FeedbackStatus.New | FeedbackStatus.Viewed | FeedbackStatus.Responsed;

// API lấy danh sách đánh giá
const fetchFeedbacks = async (
    page: number = 1,
    limit: number = 10,
    searchTerm: string = "",
    status: string = "All"
): Promise<{ items: Feedback[], totalCount: number }> => {
    try {
        const response = await fetchApi(`/Feedback/Search`, {
            method: "POST",
            body: JSON.stringify({
                pageIndex: page,
                pageSize: limit,
                keyword: searchTerm,
                status: status
            })
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi tải danh sách đánh giá:', error);
        throw error;
    }
};

// API đánh dấu đã đọc
const markFeedbackAsRead = async (id: number): Promise<void> => {
    try {
        await fetchApi(`/Feedback/${id}/MarkAsRead`, {
            method: 'PUT'
        });
    } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error);
        throw error;
    }
};

// API gửi phản hồi
const replyToFeedback = async (id: number, content: string): Promise<void> => {
    try {
        await fetchApi(`/Feedback/${id}/Reply`, {
            method: 'POST',
            body: JSON.stringify({
                content: content
            })
        });
    } catch (error) {
        console.error('Lỗi khi gửi phản hồi:', error);
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
    const [counts, setCounts] = useState({
        all: 0,
        new: 0,
        viewed: 0,
        responsed: 0
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Cập nhật số lượng cho các tab
    const updateCounts = useCallback(async () => {
        try {
            // Sử dụng API mới để lấy số liệu thống kê
            const countStats = await getFeedbackCountStats();
            
            // Cập nhật state với số liệu thống kê
            setCounts({
                all: countStats.all || 0,
                new: countStats.new || 0,
                viewed: countStats.viewed || 0,
                responsed: countStats.responsed || 0
            });
        } catch (err) {
            console.error("Lỗi khi tải số lượng đánh giá:", err);
            
            // Phương pháp dự phòng: sử dụng kết quả hiện tại nếu có
            if (filterStatus === "All" && !debouncedSearchTerm) {
                setCounts(prev => ({
                    ...prev,
                    all: totalItems || prev.all
                }));
            }
        }
    }, [totalItems, filterStatus, debouncedSearchTerm]);

    // Tải danh sách đánh giá
    const loadFeedbacks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchFeedbacks(
                currentPage,
                ItemsPerPage,
                debouncedSearchTerm,
                filterStatus
            );
            setFeedbacks(result.items);
            setTotalItems(result.totalCount);
            
            if (!debouncedSearchTerm) {
                await updateCounts();
            } else {
                setCounts(prev => {
                    const updatedCounts = { ...prev };
                    if (filterStatus === "All") {
                        updatedCounts.all = result.totalCount;
                    } else if (filterStatus === FeedbackStatus.New) {
                        updatedCounts.new = result.totalCount;
                    } else if (filterStatus === FeedbackStatus.Viewed) {
                        updatedCounts.viewed = result.totalCount;
                    } else if (filterStatus === FeedbackStatus.Responsed) {
                        updatedCounts.responsed = result.totalCount;
                    }
                    return updatedCounts;
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu đánh giá");
            setFeedbacks([]);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, filterStatus, currentPage, ItemsPerPage, updateCounts]);

    // Tải dữ liệu khi component mount hoặc các tham số thay đổi
    useEffect(() => {
        loadFeedbacks();
    }, [loadFeedbacks]);

    // Reset về trang 1 khi tìm kiếm hoặc thay đổi tab
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterStatus]);

    // Xem chi tiết đánh giá
    const handleViewDetails = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setIsDetailModalOpen(true);

        // Nếu đánh giá là mới, tự động đánh dấu đã đọc khi xem
        if (feedback.status === FeedbackStatus.New) {
            handleMarkAsRead(feedback.feedbackId);
        }
    };

    // Đánh dấu đã đọc
    const handleMarkAsRead = async (id: number) => {
        try {
            await markFeedbackAsRead(id);

            // Cập nhật local state
            setFeedbacks(prev =>
                prev.map(feedback =>
                    feedback.feedbackId === id ? { ...feedback, status: FeedbackStatus.Viewed } : feedback
                )
            );

            // Cập nhật selectedFeedback nếu đang được hiển thị
            if (selectedFeedback && selectedFeedback.feedbackId === id) {
                setSelectedFeedback({ ...selectedFeedback, status: FeedbackStatus.Viewed });
            }

            // Cập nhật số lượng trên client trước khi gọi API
            setCounts(prev => ({
                ...prev,
                new: Math.max(0, prev.new - 1),
                viewed: prev.viewed + 1
            }));

            // Sau đó cập nhật lại số lượng từ server để đảm bảo chính xác
            await updateCounts();

            toast.success("Đã đánh dấu là đã xem");
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái đánh giá");
        }
    };

    // Mở modal phản hồi
    const handleOpenReplyModal = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setReplyContent(feedback.responsedContent || "");
        setIsReplyModalOpen(true);
    };

    // Gửi phản hồi
    const handleSubmitReply = async () => {
        if (!selectedFeedback || !replyContent.trim()) return;

        setIsSubmittingReply(true);
        try {
            await replyToFeedback(selectedFeedback.feedbackId, replyContent);

            // Cập nhật số lượng trên client trước khi gọi API
            setCounts(prev => {
                const updatedCounts = { ...prev };
                updatedCounts.responsed = prev.responsed + 1;
                
                // Giảm số lượng của trạng thái trước đó
                if (selectedFeedback.status === FeedbackStatus.New) {
                    updatedCounts.new = Math.max(0, prev.new - 1);
                } else if (selectedFeedback.status === FeedbackStatus.Viewed) {
                    updatedCounts.viewed = Math.max(0, prev.viewed - 1);
                }
                
                return updatedCounts;
            });

            // Cập nhật số lượng từ server để đảm bảo chính xác
            await updateCounts();

            // Tải lại danh sách đánh giá thay vì chỉ cập nhật một mục
            await loadFeedbacks();

            toast.success("Phản hồi đã được gửi thành công");
            setIsReplyModalOpen(false);
        } catch (error) {
            toast.error("Không thể gửi phản hồi");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // Thông tin phân trang
    const totalPages = Math.ceil(totalItems / ItemsPerPage);
    const startItem = (currentPage - 1) * ItemsPerPage + 1;
    const endItem = Math.min(currentPage * ItemsPerPage, totalItems);

    return (
        <>
            <div className="container mx-auto py-6 space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Trang chủ", href: "/dashboard" },
                        { label: "Quản lý đánh giá" }
                    ]}
                />

                {/* Container chính */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    {/* Tiêu đề */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Quản lý đánh giá của khách hàng
                        </h1>
                    </div>

                    {/* Tìm kiếm */}
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

                    {/* Tabs */}
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

                    {/* Bảng dữ liệu */}
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
                                                        {feedback.createdAt}
                                                    </TableCell>
                                                    <TableCell>
                                                        {feedback.status === FeedbackStatus.Responsed ? (
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
                                                                {feedback.status === FeedbackStatus.New && (
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer hover:bg-slate-50"
                                                                        onClick={() => handleMarkAsRead(feedback.feedbackId)}
                                                                    >
                                                                        <svg className="mr-2 h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                                            <polyline points="22 4 12 14.01 9 11.01" />
                                                                        </svg>
                                                                        Đánh dấu đã xem
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {(feedback.status === FeedbackStatus.New || feedback.status === FeedbackStatus.Viewed) && (
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

                    {/* Phân trang */}
                    {!isLoading && !error && feedbacks.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t">
                            <div className="text-sm text-gray-500">
                                Hiển thị {startItem}-{endItem} trong số {totalItems} đánh giá
                            </div>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="border-gray-200 text-gray-600"
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="border-gray-200 text-gray-600"
                                >
                                    Tiếp
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal xem chi tiết */}
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
                                        <p className="text-sm mt-1">{selectedFeedback.createdAt}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                                        <Badge className={`mt-1 ${getStatusStyle(selectedFeedback.status).color}`}>
                                            {getStatusStyle(selectedFeedback.status).label}
                                        </Badge>
                                    </div>
                                </div>
                                {selectedFeedback.status === FeedbackStatus.Responsed && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Phản hồi</h3>
                                        <div className="bg-blue-50 p-3 rounded-md mt-1 text-sm">
                                            {selectedFeedback.responsedContent}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Đã phản hồi lúc: {selectedFeedback.responsedAt || ""}
                                        </p>
                                    </div>
                                )}
                                <DialogFooter className="mt-6">
                                    {(selectedFeedback.status === FeedbackStatus.New || selectedFeedback.status === FeedbackStatus.Viewed) && (
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

                {/* Modal phản hồi */}
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