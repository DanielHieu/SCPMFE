"use client";

import { useSession } from "next-auth/react";
import { Users, FileText, ParkingSquare, DollarSign, Car, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { fetchDashboardData } from "@/services/dashboard";
import { useEffect, useState } from "react";
import { DashboardData } from "@/types/dashboard";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const data = await fetchDashboardData();
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Failed to load dashboard data</p>
            </div>
        );
    }

    const { stats } = dashboardData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
                <p className="text-muted-foreground">
                    Xin chào, {session?.user?.name || "Người dùng"}! Đây là tổng quan về hệ thống của bạn.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Tổng nhân viên"
                    value={stats.totalEmployees}
                    description="Nhân viên đang hoạt động"
                    icon={Users}
                />

                <StatsCard
                    title="Tổng khách hàng"
                    value={stats.totalCustomers}
                    description="Khách hàng đã đăng ký"
                    icon={Users}
                />

                <StatsCard
                    title="Tổng hợp đồng"
                    value={stats.totalContracts}
                    description="Hợp đồng đang hoạt động"
                    icon={FileText}
                />

                <StatsCard
                    title="Bãi đậu xe"
                    value={stats.totalParkingLots}
                    description="Vị trí đậu xe đang hoạt động"
                    icon={ParkingSquare}
                />

                <StatsCard
                    title="Tổng doanh thu"
                    value={`${stats.totalRevenue.toLocaleString('vi-VN')} ₫`}
                    description="Doanh thu tháng này"
                    icon={DollarSign}
                />

                <StatsCard
                    title="Hợp đồng đang hoạt động"
                    value={stats.activeContracts}
                    description="Hợp đồng đang có hiệu lực"
                    icon={Clock}
                />

                <StatsCard
                    title="Vị trí còn trống"
                    value={stats.availableSpots}
                    description="Vị trí đậu xe còn trống"
                    icon={Car}
                />

                <StatsCard
                    title="Tỷ lệ sử dụng"
                    value={`${stats.averageOccupancy}%`}
                    description="Tỷ lệ sử dụng trung bình"
                    icon={ParkingSquare}
                />
            </div>
        </div>
    );
}
