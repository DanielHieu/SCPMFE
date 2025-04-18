"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { searchContracts } from "@/lib/api/contract.api";
import { Contract } from "@/types/contract";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";

type FilterStatus = "all" | "active" | "expired" | "inactive";

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [counts, setCounts] = useState({
        all: 0,
        active: 0,
        expired: 0,
        inactive: 0,
    });

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
                active: contracts.filter((c) => c.status === "Active").length,
                expired: contracts.filter((c) => c.status === "Expired").length,
                inactive: contracts.filter((c) => c.status === "Inactive").length,
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
                filterStatus === "all" ||
                (filterStatus === "active" && contract.status === "Active") ||
                (filterStatus === "expired" && contract.status === "Expired") ||
                (filterStatus === "inactive" && contract.status === "Inactive");

            return matchesSearch && matchesFilter;
        });
    }, [contracts, searchTerm, filterStatus]);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="space-y-6 w-full">
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: "Trang chủ", href: "/dashboard" },
                        { label: "Quản lý hợp đồng" }
                    ]}
                />
            </div>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Quản lý hợp đồng</h1>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 px-1">
                <div className="w-full md:w-auto md:flex-grow lg:max-w-md">
                    <Input
                        placeholder="Tìm kiếm số hợp đồng/tên khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-full"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="all">
                        Tất cả ({counts.all})
                    </TabsTrigger>
                    <TabsTrigger value="active">
                        Đang hiệu lực ({counts.active})
                    </TabsTrigger>
                    <TabsTrigger value="expired">
                        Đã hết hạn ({counts.expired})
                    </TabsTrigger>
                    <TabsTrigger value="inactive">
                        Chưa hiệu lực ({counts.inactive})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Table area */}
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-white">
                {isLoading && (
                    <div className="p-6 text-center">Đang tải dữ liệu hợp đồng...</div>
                )}
                {error && (
                    <div className="p-6 text-center text-red-500">Lỗi: {error}</div>
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
                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
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
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${contract.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                    contract.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {contract.status === 'Active' ? 'Đang hiệu lực' :
                                                        contract.status === 'Expired' ? 'Đã hết hạn' : 'Chưa hiệu lực'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {contract.needToProcess ? 'Cần duyệt' : ''}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/contracts/${contract.contractId}`}>
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
    );
}
