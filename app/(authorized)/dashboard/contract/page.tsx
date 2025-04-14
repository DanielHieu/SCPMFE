"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchApi } from "@/lib/api/api-helper";
import { MonthlyRevenues, ParkingLotMonthlyRevenue, ParkingLotRevenue, QuarterlyRevenues } from "@/types/dashboard";

export default function ContractRevenuePage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenues[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyRevenues[]>([]);
  const [yearlyData, setYearlyData] = useState<ParkingLotRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractRevenue = async () => {
      try {
        setLoading(true);

        // Fetch monthly data
        const monthlyResponse = await fetchApi("/Report/GetParkingLotContractMonthlyRevenues", { cache: 'no-store' });
        const formattedMonthlyData = formatMonthlyData(monthlyResponse as ParkingLotMonthlyRevenue[]);
        setMonthlyData(formattedMonthlyData);

        // Calculate quarterly data from monthly data
        const formattedQuarterlyData = formatQuarterlyData(monthlyResponse);
        setQuarterlyData(formattedQuarterlyData);
        // Calculate yearly data from monthly data
        const formattedYearlyData = formatYearlyData(monthlyResponse);
        setYearlyData(formattedYearlyData);
      } catch (error) {
        console.error("Error fetching contract revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractRevenue();
  }, []);

  // Format API response or generate mock data if API endpoints don't exist yet
  const formatMonthlyData = (data: ParkingLotMonthlyRevenue[]): MonthlyRevenues[] => {
    // Mock data for months 1-12 in current year
    const months = [{ 
      month: 1, 
      name: "Tháng 1"
    }, { 
      month: 2,
      name: "Tháng 2"
    }, { 
      month: 3,
      name: "Tháng 3"
    }, { 
      month: 4,
      name: "Tháng 4"
    }, { 
      month: 5,
      name: "Tháng 5"
    }, { 
      month: 6,
      name: "Tháng 6"
    }, { 
      month: 7,
      name: "Tháng 7"
    }, { 
      month: 8,
      name: "Tháng 8"
    }, { 
      month: 9,
      name: "Tháng 9"
    }, { 
      month: 10,
      name: "Tháng 10"
    }, { 
      month: 11,
      name: "Tháng 11"
    }, { 
      month: 12,
      name: "Tháng 12"
    }];

    return months.map((value, index) => ({
      month: value.month,
      parkingLotRevenues: data.filter(x=> x.month == value.month).map(x=> ({
        parkingLotName: x.parkingLotName,
        totalRevenue: x.revenue
      }))
    }));
  };

  const formatQuarterlyData = (data: ParkingLotMonthlyRevenue[]): QuarterlyRevenues[] => {
    // Define quarters
    const quarters = [
      { quarter: 1, months: [1, 2, 3] },
      { quarter: 2, months: [4, 5, 6] },
      { quarter: 3, months: [7, 8, 9] },
      { quarter: 4, months: [10, 11, 12] }
    ];

    return quarters.map(q => ({
      quarter: q.quarter,
      parkingLotRevenues: Array.from(
        // Group by parking lot name and sum revenues for the quarter
        data.filter(x => q.months.includes(x.month))
          .reduce((map, item) => {
            const key = item.parkingLotName;
            const current = map.get(key) || 0;
            map.set(key, current + item.revenue);
            return map;
          }, new Map<string, number>())
      ).map(([parkingLotName, totalRevenue]) => ({
        parkingLotName,
        totalRevenue
      }))
    }));
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
    ).map(([parkingLotName, totalRevenue]) => ({
      parkingLotName,
      totalRevenue
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Doanh Thu Hợp Đồng</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Doanh Thu Hợp Đồng Theo Tháng ({new Date().getFullYear()})</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={monthlyData.map(month => ({
                      name: `Tháng ${month.month}`,
                      ...Object.fromEntries(month.parkingLotRevenues.map(lot => [lot.parkingLotName, lot.totalRevenue]))
                    }))} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, "Doanh Thu"]} />
                    <Legend />
                    {monthlyData[0]?.parkingLotRevenues.map((lot, index) => (
                      <Bar 
                        key={lot.parkingLotName} 
                        dataKey={lot.parkingLotName} 
                        fill={`hsl(${index * 30}, 70%, 50%)`} 
                        name={lot.parkingLotName} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quarterly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Doanh Thu Hợp Đồng Theo Quý ({new Date().getFullYear()})</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={quarterlyData.map(quarter => ({
                      name: `Quý ${quarter.quarter}`,
                      ...Object.fromEntries(quarter.parkingLotRevenues.map(lot => [lot.parkingLotName, lot.totalRevenue]))
                    }))} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, "Doanh Thu"]} />
                    <Legend />
                    {quarterlyData[0]?.parkingLotRevenues.map((lot, index) => (
                      <Bar 
                        key={lot.parkingLotName} 
                        dataKey={lot.parkingLotName} 
                        fill={`hsl(${index * 30 + 120}, 70%, 50%)`} 
                        name={lot.parkingLotName} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Yearly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Doanh Thu Hợp Đồng Theo Bãi Đỗ Xe ({new Date().getFullYear()})</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={yearlyData.map(lot => ({
                      name: lot.parkingLotName,
                      revenue: lot.totalRevenue
                    }))} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, "Doanh Thu"]} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#ffc658" name="Doanh Thu" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
