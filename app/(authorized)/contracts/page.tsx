"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { searchContracts } from "@/lib/api/contract.api";
import { Contract, ContractStatus } from "@/types/contract";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

type FilterStatus = "All" | "Active" | "Expired" | "Inactive" | "PendingActivation";

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
    const [counts, setCounts] = useState({
        all: 0,
        active: 0,
        expired: 0,
        inactive: 0,
        pendingActivation: 0,
    });

    // Hàm lấy class cho badge dựa vào trạng thái hợp đồng
    const getContractStatusStyle = (status: string) => {
        switch (status) {
            case ContractStatus.Active:
                return "bg-emerald-100 text-emerald-800";
            case ContractStatus.Expired:
                return "bg-red-100 text-red-800";
            case ContractStatus.Inactive:
                return "bg-yellow-100 text-yellow-800";
            case ContractStatus.PendingActivation:
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Hàm lấy text hiển thị dựa vào trạng thái hợp đồng
    const getContractStatusText = (status: string) => {
        switch (status) {
            case ContractStatus.Active:
                return "Đang hiệu lực";
            case ContractStatus.Expired:
                return "Đã hết hạn";
            case ContractStatus.Inactive:
                return "Chờ xử lý";
            case ContractStatus.PendingActivation:
                return "Chờ kích hoạt";
            default:
                return status;
        }
    };

    // Fetch contracts data
    const fetchContracts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Replace with actual API call
            const contracts = await searchContracts({
                keyword: "",
            });

            setContracts(contracts || []);

            // Calculate counts
            const newCounts = {
                all: contracts.length,
                active: contracts.filter((c) => c.status === ContractStatus.Active).length,
                expired: contracts.filter((c) => c.status === ContractStatus.Expired).length,
                inactive: contracts.filter((c) => c.status === ContractStatus.Inactive).length,
                pendingActivation: contracts.filter((c) => c.status === ContractStatus.PendingActivation).length,
            };

            setCounts(newCounts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    // Filter contracts based on search term and filter status
    const filteredContracts = useMemo(() => {
        return contracts.filter((contract) => {
            const matchesSearch =
                contract.parkingSpaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.car.customerName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter =
                filterStatus === "All" ||
                (filterStatus === "Active" && contract.status === ContractStatus.Active) ||
                (filterStatus === "Expired" && contract.status === ContractStatus.Expired) ||
                (filterStatus === "Inactive" && contract.status === ContractStatus.Inactive) ||
                (filterStatus === "PendingActivation" && contract.status === ContractStatus.PendingActivation);

            return matchesSearch && matchesFilter;
        });
    }, [contracts, searchTerm, filterStatus]);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Breadcrumb
                items={[
                    { label: "Trang chủ", href: "/dashboard" },
                    { label: "Quản lý hợp đồng" }
                ]}
            />

            {/* Unified container with white background */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {/* Header section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Quản lý hợp đồng
                    </h1>
                </div>

                {/* Search section */}
                <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm số hợp đồng/tên khách hàng/biển số xe..."
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
                                Tất cả ({counts.all})
                            </TabsTrigger>
                            <TabsTrigger
                                value="Active"
                                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                            >
                                Đang hiệu lực ({counts.active})
                            </TabsTrigger>
                            <TabsTrigger
                                value="Expired"
                                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                            >
                                Đã hết hạn ({counts.expired})
                            </TabsTrigger>
                            <TabsTrigger
                                value="Inactive"
                                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                            >
                                Chưa hiệu lực ({counts.inactive})
                            </TabsTrigger>
                            <TabsTrigger
                                value="PendingActivation"
                                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
                            >
                                Chờ kích hoạt ({counts.pendingActivation})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Table area - no padding to connect directly with tabs */}
                <div className="pb-0">
                    {isLoading && (
                        <div className="p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                            <p className="mt-2 text-gray-500">Đang tải dữ liệu hợp đồng...</p>
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
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Số hợp đồng</th>
                                        <th className="px-6 py-3">Khách hàng</th>
                                        <th className="px-6 py-3">Xe</th>
                                        <th className="px-6 py-3">Ngày bắt đầu</th>
                                        <th className="px-6 py-3">Ngày kết thúc</th>
                                        <th className="px-6 py-3">Trạng thái</th>
                                        <th className="px-6 py-3">Tình trạng</th>
                                        <th className="px-6 py-3">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContracts.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                                Không tìm thấy hợp đồng nào
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredContracts.map((contract) => (
                                            <tr key={contract.contractId} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">{contract.contractId}</td>
                                                <td className="px-6 py-4">{contract.car.customerName}</td>
                                                <td className="px-6 py-4">{contract.car.licensePlate}</td>
                                                <td className="px-6 py-4">{contract.startDateString}</td>
                                                <td className="px-6 py-4">{contract.endDateString}</td>
                                                <td className="px-6 py-4">
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={getContractStatusStyle(contract.status)}
                                                    >
                                                        {getContractStatusText(contract.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {contract.needToProcess ?
                                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                                            Cần duyệt
                                                        </Badge>
                                                        : ''}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link href={`/contracts/${contract.contractId}`} className="text-blue-600 hover:text-blue-800">
                                                        Chi tiết
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
