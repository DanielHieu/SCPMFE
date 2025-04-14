"use client";

import { useEffect, useState } from "react";
import { WailkinDateRevenue } from "@/types/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Banknote } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchWalkinTodayRevenue } from "@/lib/api/dashboard.api";

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [walkinTodayRevenue, setWalkinTodayRevenue] = useState<WailkinDateRevenue | null>(null);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const todayRevenue = await fetchWalkinTodayRevenue();
                setWalkinTodayRevenue(todayRevenue);
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

    if (!walkinTodayRevenue) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Failed to load dashboard data</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-6">
                {/* Bar Chart - Parking Lots Revenue */}
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="border-b pb-3">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                            <CardTitle className="text-lg font-medium">
                                Doanh thu vãng lai theo bãi đỗ xe trong ngày {walkinTodayRevenue.revenueDate}
                            </CardTitle>
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                                <Banknote className="h-5 w-5" />
                                <span className="font-bold">{walkinTodayRevenue.totalRevenue.toLocaleString('vi-VN')} Đ</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {walkinTodayRevenue.walkinDailyRevenueDetails && walkinTodayRevenue.walkinDailyRevenueDetails.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={walkinTodayRevenue.walkinDailyRevenueDetails}
                                        margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
                                        barSize={40}
                                        layout="vertical"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            type="number"
                                            tickFormatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
                                            tick={{ fontSize: 12, fill: '#666' }}
                                            tickLine={false}
                                            axisLine={{ stroke: '#e0e0e0' }}
                                            width={100}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="parkingLotName"
                                            tick={{ fontSize: 12, fill: '#666' }}
                                            tickLine={false}
                                            axisLine={{ stroke: '#e0e0e0' }}
                                            width={50}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                                            labelFormatter={(label) => `Bãi đỗ xe: ${label}`}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                border: 'none'
                                            }}
                                        />
                                        <Bar
                                            dataKey="totalRevenue"
                                            fill="#3b82f6"
                                            name="Doanh thu"
                                            radius={[0, 4, 4, 0]}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center h-80 bg-gray-50 rounded-lg">
                                <Banknote className="h-12 w-12 text-gray-300 mb-2" />
                                <p className="text-gray-500 font-medium">Không có dữ liệu doanh thu</p>
                                <p className="text-gray-400 text-sm mt-1">Dữ liệu sẽ được hiển thị khi có giao dịch</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
