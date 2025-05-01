import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { SummaryCard } from "./SummaryCard"
import { Activity, Car, DollarSign, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api/api-helper"
import { SummaryRevenueReportResponse, ParkingLotRevenue, MonthlyRevenueByType } from "@/types/dashboard"
import { ParkingLotBarChart, PieChart } from "../ui/charts"

// Helper to get month names in Vietnamese (if not already defined elsewhere)
const getMonthNameVn = (monthNumber: number): string => {
    const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];
    return monthNames[monthNumber - 1] || `Tháng ${monthNumber}`;
};

const RevenueTabContent = () => {
    const [summaryData, setSummaryData] = useState<SummaryRevenueReportResponse | null>(null)
    const [parkingLotRevenue, setParkingLotRevenue] = useState<ParkingLotRevenue[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [monthlyChartData, setMonthlyChartData] = useState<any>(null);
    const [parkingLotChartData, setParkingLotChartData] = useState<any>(null);
    const [pieChartData, setPieChartData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const currentYear = new Date().getFullYear();

                // Fetch all data concurrently (without generic types for fetchApi)
                const [summaryResponseRaw, parkingLotRevenueResponseRaw, monthlyRevenueResponseRaw] = await Promise.all([
                    fetchApi("/Report/SummaryRevenue"),
                    fetchApi("/Report/ParkingLotRevenue"),
                    fetchApi(`/Report/MonthlyRevenueByTypes?year=${currentYear}`)
                ]);

                // Set Summary Data with type assertion
                const summaryResponse = summaryResponseRaw as SummaryRevenueReportResponse | null;
                setSummaryData(summaryResponse || null);

                // Set Parking Lot Revenue Data with type assertion
                const fetchedParkingLots: ParkingLotRevenue[] = (parkingLotRevenueResponseRaw as ParkingLotRevenue[]) || [];
                setParkingLotRevenue(fetchedParkingLots);

                // --- Prepare Monthly Chart Data ---
                const fetchedMonthlyData: MonthlyRevenueByType[] = (monthlyRevenueResponseRaw as MonthlyRevenueByType[]) || [];
                const monthlyLabels = Array.from({ length: 12 }, (_, i) => getMonthNameVn(i + 1));
                const contractData = monthlyLabels.map((_, index) => {
                    const monthNum = index + 1;
                    const month = fetchedMonthlyData.find(d => d.month === monthNum);
                    return month?.contractRevenue || 0;
                });
                const walkinData = monthlyLabels.map((_, index) => {
                    const monthNum = index + 1;
                    const month = fetchedMonthlyData.find(d => d.month === monthNum);
                    return month?.walkinRevenue || 0;
                });

                setMonthlyChartData({
                    labels: monthlyLabels,
                    datasets: [
                        {
                            label: 'Hợp đồng',
                            data: contractData,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)', // Greenish
                            stack: 'Stack 0',
                        },
                        {
                            label: 'Vãng lai',
                            data: walkinData,
                            backgroundColor: 'rgba(53, 162, 235, 0.5)', // Blueish
                            stack: 'Stack 0',
                        },
                    ],
                });
                // --- End Monthly Chart Data ---

                // --- Prepare Parking Lot Bar Chart Data ---
                const topParkingLots = fetchedParkingLots
                    .sort((a: ParkingLotRevenue, b: ParkingLotRevenue) => b.revenue - a.revenue)
                    .slice(0, 10);

                setParkingLotChartData({
                    labels: topParkingLots.map((lot: ParkingLotRevenue) => lot.parkingLotName),
                    datasets: [
                        {
                            label: 'Doanh thu',
                            data: topParkingLots.map((lot: ParkingLotRevenue) => lot.revenue),
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                            borderColor: 'rgba(139, 92, 246, 1)',
                            borderWidth: 1,
                        },
                    ],
                });
                // --- End Parking Lot Bar Chart Data ---

                // --- Prepare Pie Chart Data ---
                setPieChartData({
                    labels: ["Hợp đồng", "Vãng lai"],
                    datasets: [
                        {
                            label: 'Phân bổ Doanh thu',
                            data: [
                                summaryResponse?.contractRevenueInYear || 0,
                                summaryResponse?.walkinRevenueInYear || 0,
                            ],
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(53, 162, 235, 0.8)',
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(53, 162, 235, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });
                // --- End Pie Chart Data ---

            } catch (error) {
                console.error("Failed to fetch revenue data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Chart options (can be customized further)
    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        console.log("callbacks", context.parsed.y);
                        
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
            
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: number | string) {
                        if (typeof value === 'number') {
                            return formatCurrency(value);
                        }
                        
                        return value;
                    }
                }
            }
        }
    };

    const stackedBarChartOptions = {
        ...commonChartOptions,
        scales: {
            x: {
                stacked: true, // Enable stacking on x-axis
            },
            y: {
                ...commonChartOptions.scales.y, // Inherit y-axis options
                stacked: true, // Enable stacking on y-axis
            }
        }
    };

    // Options specifically for the horizontal parking lot bar chart
    const horizontalBarChartOptions = {
        ...commonChartOptions,
        indexAxis: 'y' as const, // Make bars horizontal
        scales: {
            x: { // Now the value axis is X
                beginAtZero: true,
                ticks: {
                    callback: function (value: number | string) {
                        if (typeof value === 'number') {
                            return formatCurrency(value);
                        }
                        return value;
                    }
                }
            },
            y: { // Label axis is Y
                // Add any specific label formatting if needed
            }
        },
        plugins: {
          
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        console.log("horizontalBarChartOptions", context.parsed.x);
                        
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
            
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.x);
                        }
                        return label;
                    }
                }
            },
            legend: { display: false } // Hide legend for single dataset
        }
    };

    // Options for Pie chart (can be simpler)
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += formatCurrency(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Doanh thu năm"
                    value={summaryData ? formatCurrency(summaryData.totalRevenueInYear) : "Loading..."}
                    icon={<DollarSign className="h-4 w-4 text-purple-600" />}
                    className="border-l-purple-600"
                />
                <SummaryCard
                    title="Doanh thu hợp đồng"
                    value={summaryData ? formatCurrency(summaryData.contractRevenueInYear) : "Loading..."}
                    icon={<FileText className="h-4 w-4 text-green-600" />}
                    className="border-l-green-600"
                />
                <SummaryCard
                    title="Doanh thu vãng lai"
                    value={summaryData ? formatCurrency(summaryData.walkinRevenueInYear || (summaryData.totalRevenueInYear - summaryData.contractRevenueInYear)) : "Loading..."}
                    icon={<Car className="h-4 w-4 text-blue-600" />}
                    className="border-l-blue-600"
                />
                <SummaryCard
                    title="Doanh thu hôm nay"
                    value={summaryData ? formatCurrency(summaryData.totalRevenueInDay) : "Loading..."}
                    icon={<Activity className="h-4 w-4 text-amber-600" />}
                    className="border-l-amber-600"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu theo bãi đỗ xe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {isLoading || !parkingLotChartData ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <ParkingLotBarChart
                                    data={parkingLotChartData}
                                    options={horizontalBarChartOptions}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Phân bổ doanh thu theo loại</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {isLoading || !pieChartData ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <PieChart
                                    data={pieChartData}
                                    options={pieChartOptions}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu theo tháng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {isLoading || !monthlyChartData ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <ParkingLotBarChart
                                    data={monthlyChartData}
                                    options={stackedBarChartOptions}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default RevenueTabContent
