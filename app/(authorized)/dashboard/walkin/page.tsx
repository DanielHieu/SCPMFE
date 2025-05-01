"use client";

import { useState, useEffect } from "react";
import ParkingLotWalkinRevenueInYear from "@/components/dashboard/ParkingLotWalkinRevenueInYear";

export default function ContractDashboardPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYears([currentYear, currentYear - 1, currentYear - 2]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Doanh Thu Vãng Lai</h1>
        <div className="relative w-48">
          <select
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                Năm {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ParkingLotWalkinRevenueInYear year={selectedYear} />
      </div>
    </div>
  );
}
