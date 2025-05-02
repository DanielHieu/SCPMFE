"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    LabelList
} from "recharts";
import { fetchApi } from "@/lib/api/api-helper";
import { MonthlyRevenues, ParkingLotMonthlyRevenue, ParkingLotRevenue, QuarterlyRevenues } from "@/types/dashboard";

// Hàm định dạng tiền VND
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

// Design system constants
const COLORS = {
    primary: '#0066CC',
    secondary: '#FF7300',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    gray: {
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    }
};

// Chart color palette
const CHART_COLORS = [
    '#0066CC', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
    '#84CC16', '#06B6D4', '#A855F7', '#22C55E', '#FB7185'
];

// Custom tooltip hiển thị thông tin khi hover
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
                <p className="font-semibold text-gray-800">{label}</p>
                <div className="mt-3 space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <p className="text-sm">
                                <span className="font-medium">{entry.name}:</span>{' '}
                                <span className="font-semibold">{formatCurrency(entry.value)}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// Component hiển thị tổng quan doanh thu
const RevenueSummaryCard = ({ data, title }: { data: ParkingLotRevenue[], title: string }) => {
    // Tính tổng doanh thu
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    
    // Sắp xếp bãi đỗ xe theo doanh thu giảm dần
    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);
    
    // Lấy top 3 bãi đỗ có doanh thu cao nhất
    const topParking = sortedData.slice(0, 3);
    
    return (
        <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-primary mb-4" style={{ color: COLORS.primary }}>
                    {formatCurrency(totalRevenue)}
                </div>
                
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500">Top bãi đỗ xe</p>
                    {topParking.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                                <span className="text-sm font-medium truncate max-w-[150px]" title={item.parkingLotName}>{item.parkingLotName}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{formatCurrency(item.revenue)}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default function ParkingLotWalkinRevenueInYear({ year }: { year: number }) {
    const [monthlyData, setMonthlyData] = useState<MonthlyRevenues[]>([]);
    const [quarterlyData, setQuarterlyData] = useState<QuarterlyRevenues[]>([]);
    const [yearlyData, setYearlyData] = useState<ParkingLotRevenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [parkingLots, setParkingLots] = useState<string[]>([]);

    useEffect(() => {
        const fetchWalkinRevenue = async () => {
            try {
                setLoading(true);

                // Fetch monthly data
                const monthlyResponse = await fetchApi(`/Report/GetParkingLotWalkinMonthlyRevenues?year=${year}`, { cache: 'no-store' });

                const formattedMonthlyData = formatMonthlyData(monthlyResponse as ParkingLotMonthlyRevenue[]);
                setMonthlyData(formattedMonthlyData);

                // Extract unique parking lot names for consistent coloring
                if (monthlyResponse && monthlyResponse.length > 0) {
                    const uniqueParkingLots = Array.from(
                        new Set((monthlyResponse as ParkingLotMonthlyRevenue[]).map(item => item.parkingLotName))
                    );
                    setParkingLots(uniqueParkingLots);
                }

                // Calculate quarterly data from monthly data
                const formattedQuarterlyData = formatQuarterlyData(monthlyResponse);
                setQuarterlyData(formattedQuarterlyData);

                // Calculate yearly data from monthly data
                const formattedYearlyData = formatYearlyData(monthlyResponse);
                setYearlyData(formattedYearlyData);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu doanh thu vãng lai:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWalkinRevenue();
    }, [year]);

    // Format API response or generate mock data if API endpoints don't exist yet
    const formatMonthlyData = (data: ParkingLotMonthlyRevenue[]): MonthlyRevenues[] => {
        // Tạo mảng 12 tháng
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            name: `Tháng ${i + 1}`
        }));

        return months.map((value) => {
            const monthData: MonthlyRevenues = {
                month: value.month,
                name: value.name,
                parkingLotRevenues: data.filter(x => x.month === value.month).map(x => ({
                    parkingLotName: x.parkingLotName,
                    revenue: x.revenue,
                    totalRevenue: x.revenue
                }))
            };

            return monthData;
        });
    };

    const formatQuarterlyData = (data: ParkingLotMonthlyRevenue[]): QuarterlyRevenues[] => {
        // Define quarters
        const quarters = [
            { quarter: 1, months: [1, 2, 3] },
            { quarter: 2, months: [4, 5, 6] },
            { quarter: 3, months: [7, 8, 9] },
            { quarter: 4, months: [10, 11, 12] }
        ];

        return quarters.map(q => {
            const quarterData: QuarterlyRevenues = {
                quarter: q.quarter,
                name: `Quý ${q.quarter}`,
                parkingLotRevenues: Array.from(
                    // Group by parking lot name and sum revenues for the quarter
                    data.filter(x => q.months.includes(x.month))
                        .reduce((map, item) => {
                            const key = item.parkingLotName;
                            const current = map.get(key) || 0;
                            map.set(key, current + item.revenue);
                            return map;
                        }, new Map<string, number>())
                ).map(([parkingLotName, calculatedRevenue]) => ({
                    parkingLotName,
                    revenue: calculatedRevenue,
                    totalRevenue: calculatedRevenue
                }))
            };

            return quarterData;
        });
    };

    const formatYearlyData = (data: ParkingLotMonthlyRevenue[]): ParkingLotRevenue[] => {
        // Group by parking lot name and sum revenues for the year
        return Array.from(
            data.reduce((map, item) => {
                const key = item.parkingLotName;
                const current = map.get(key) || 0;
                map.set(key, current + item.revenue);
                return map;
            }, new Map<string, number>())
        ).map(([parkingLotName, calculatedRevenue]) => ({
            parkingLotName,
            revenue: calculatedRevenue,
            totalRevenue: calculatedRevenue
        }));
    };

    // Tạo mảng màu dynamically cho các bãi đỗ xe
    const getColorByIndex = (index: number, total: number): string => {
        // Sử dụng màu từ mảng nếu có đủ
        if (index < CHART_COLORS.length) {
            return CHART_COLORS[index];
        }
        
        // Nếu không đủ màu, tạo màu mới dựa trên vị trí
        const hue = (index * 137.5) % 360; // Số vàng để tạo màu phân bố đều
        return `hsl(${hue}, 70%, 50%)`;
    };

    // Tính tổng doanh thu cho mỗi tháng/quý
    const calculateTotalRevenue = (data: any) => {
        if (!data || !Array.isArray(data) || data.length === 0) return 0;

        return data.reduce((total, item) => total + (item.revenue || 0), 0);
    };

    // Tạo dữ liệu biểu đồ cho monthly view
    const prepareMonthlyChartData = () => {
        return monthlyData.map(month => {
            // Tạo một object với tháng làm key
            const result: any = {
                name: month.name || `Tháng ${month.month}`,
                totalRevenue: calculateTotalRevenue(month.parkingLotRevenues)
            };

            // Thêm doanh thu cho từng bãi đỗ xe
            month.parkingLotRevenues.forEach(lot => {
                result[lot.parkingLotName] = lot.revenue;
            });

            return result;
        });
    };

    // Tạo dữ liệu biểu đồ cho quarterly view
    const prepareQuarterlyChartData = () => {
        return quarterlyData.map(quarter => {
            // Tạo một object với quý làm key
            const result: any = {
                name: quarter.name || `Quý ${quarter.quarter}`,
                totalRevenue: calculateTotalRevenue(quarter.parkingLotRevenues)
            };

            // Thêm doanh thu cho từng bãi đỗ xe
            quarter.parkingLotRevenues.forEach(lot => {
                result[lot.parkingLotName] = lot.revenue;
            });

            return result;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.primary }}></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle className="text-xl font-semibold text-gray-800">Doanh Thu Vãng Lai ({year})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <RevenueSummaryCard 
                                title={`Doanh thu năm ${year}`} 
                                data={yearlyData}
                            />
                            <RevenueSummaryCard 
                                title="Doanh thu 6 tháng đầu năm" 
                                data={
                                    // Tính tổng doanh thu 6 tháng đầu năm cho mỗi bãi đỗ
                                    parkingLots.map(lot => {
                                        const revenue = monthlyData
                                            .filter(m => m.month <= 6)
                                            .flatMap(m => m.parkingLotRevenues)
                                            .filter(item => item.parkingLotName === lot)
                                            .reduce((sum, item) => sum + item.revenue, 0);
                                        
                                        return {
                                            parkingLotName: lot,
                                            revenue,
                                            totalRevenue: revenue
                                        };
                                    })
                                }
                            />
                            <RevenueSummaryCard 
                                title="Doanh thu 6 tháng cuối năm" 
                                data={
                                    // Tính tổng doanh thu 6 tháng cuối năm cho mỗi bãi đỗ
                                    parkingLots.map(lot => {
                                        const revenue = monthlyData
                                            .filter(m => m.month > 6)
                                            .flatMap(m => m.parkingLotRevenues)
                                            .filter(item => item.parkingLotName === lot)
                                            .reduce((sum, item) => sum + item.revenue, 0);
                                        
                                        return {
                                            parkingLotName: lot,
                                            revenue,
                                            totalRevenue: revenue
                                        };
                                    })
                                }
                            />
                        </div>
                        
                        {/* Monthly Chart */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Doanh thu theo tháng</h3>
                            <div className="h-[400px] w-full bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart
                                        data={prepareMonthlyChartData()}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{ fontSize: 12, fill: COLORS.gray[700] }}
                                            axisLine={{ stroke: COLORS.gray[300] }}
                                            tickLine={{ stroke: COLORS.gray[300] }}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => value.toLocaleString('vi-VN')}
                                            tick={{ fontSize: 12, fill: COLORS.gray[700] }}
                                            axisLine={{ stroke: COLORS.gray[300] }}
                                            tickLine={{ stroke: COLORS.gray[300] }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend 
                                            verticalAlign="top" 
                                            height={36}
                                            wrapperStyle={{ fontSize: '12px' }}
                                        />
                                        {/* Hiển thị từng bãi đỗ xe bằng cột */}
                                        {parkingLots.map((parkingLotName, index) => (
                                            <Bar 
                                                key={parkingLotName}
                                                dataKey={parkingLotName}
                                                name={parkingLotName}
                                                fill={getColorByIndex(index, parkingLots.length)}
                                                radius={[4, 4, 0, 0]}
                                                stackId="a"
                                                barSize={20}
                                            />
                                        ))}
                                        
                                        {/* Hiển thị tổng doanh thu bằng đường */}
                                        <Line 
                                            type="monotone" 
                                            dataKey="totalRevenue" 
                                            name="Tổng doanh thu" 
                                            stroke={COLORS.secondary}
                                            strokeWidth={2.5} 
                                            dot={{ r: 4, fill: COLORS.secondary, stroke: COLORS.secondary }}
                                            activeDot={{ r: 6, fill: COLORS.secondary, stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        
                        {/* Quarterly and Yearly Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Quarterly Chart */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Doanh thu theo quý</h3>
                                <div className="h-[350px] w-full bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={prepareQuarterlyChartData()}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                            <XAxis 
                                                dataKey="name" 
                                                tick={{ fontSize: 12, fill: COLORS.gray[700] }}
                                                axisLine={{ stroke: COLORS.gray[300] }}
                                                tickLine={{ stroke: COLORS.gray[300] }}
                                            />
                                            <YAxis 
                                                tickFormatter={(value) => value.toLocaleString('vi-VN')}
                                                tick={{ fontSize: 12, fill: COLORS.gray[700] }}
                                                axisLine={{ stroke: COLORS.gray[300] }}
                                                tickLine={{ stroke: COLORS.gray[300] }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend 
                                                verticalAlign="top" 
                                                height={36}
                                                wrapperStyle={{ fontSize: '12px' }}
                                            />
                                            {/* Hiển thị từng bãi đỗ xe bằng cột */}
                                            {parkingLots.map((parkingLotName, index) => (
                                                <Bar 
                                                    key={parkingLotName}
                                                    dataKey={parkingLotName}
                                                    name={parkingLotName}
                                                    fill={getColorByIndex(index, parkingLots.length)}
                                                    radius={[4, 4, 0, 0]}
                                                    stackId="a"
                                                    barSize={25}
                                                />
                                            ))}
                                            
                                            {/* Hiển thị tổng doanh thu bằng đường */}
                                            <Line 
                                                type="monotone" 
                                                dataKey="totalRevenue" 
                                                name="Tổng doanh thu" 
                                                stroke={COLORS.secondary}
                                                strokeWidth={2.5}
                                                dot={{ r: 4, fill: COLORS.secondary, stroke: COLORS.secondary }}
                                                activeDot={{ r: 6, fill: COLORS.secondary, stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            {/* Yearly Chart */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Doanh thu bãi đỗ theo năm</h3>
                                <div className="h-[350px] w-full bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={yearlyData.map((lot, index) => ({
                                                name: lot.parkingLotName,
                                                revenue: lot.revenue,
                                                fill: getColorByIndex(index, yearlyData.length)
                                            }))}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                            layout="vertical"
                                        >
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                                            <XAxis 
                                                type="number" 
                                                tickFormatter={(value) => value.toLocaleString('vi-VN')}
                                                tick={{ fontSize: 12, fill: COLORS.gray[700] }}
                                                axisLine={{ stroke: COLORS.gray[300] }}
                                                tickLine={{ stroke: COLORS.gray[300] }}
                                            />
                                            <YAxis 
                                                type="category" 
                                                dataKey="name"
                                                tick={{ fontSize: 12, fill: COLORS.gray[700] }}
                                                axisLine={{ stroke: COLORS.gray[300] }}
                                                tickLine={{ stroke: COLORS.gray[300] }}
                                                width={120}
                                            />
                                            <Tooltip 
                                                formatter={(value) => [formatCurrency(Number(value)), "Doanh thu"]}
                                                labelFormatter={(value) => `Bãi đỗ xe: ${value}`}
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    padding: '12px'
                                                }}
                                            />
                                            <Bar 
                                                dataKey="revenue" 
                                                name="Doanh thu"
                                                radius={[0, 4, 4, 0]}
                                                fill={COLORS.primary}
                                            >
                                                {yearlyData.map((entry, index) => (
                                                    <LabelList 
                                                        key={`label-${index}`}
                                                        dataKey="revenue" 
                                                        position="right" 
                                                        formatter={(value: number) => formatCurrency(value)}
                                                        style={{ 
                                                            fill: COLORS.gray[800], 
                                                            fontSize: 12, 
                                                            fontWeight: 500 
                                                        }}
                                                    />
                                                ))}
                                            </Bar>
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
