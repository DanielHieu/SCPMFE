"use client";

import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Default options for all charts
const defaultOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

// Bar Chart Component
export function ParkingLotBarChart({ data, options = {} }: { data?: any; options?: ChartOptions<"bar"> }) {
  // Default data if none provided
  const defaultData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Bãi A",
        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Bãi B",
        data: [45, 49, 60, 71, 46, 45, 30, 35, 50, 60, 65, 70],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  return (
    <Bar
      data={data || defaultData}
      options={{ ...defaultOptions, ...options }}
    />
  );
}

// Line Chart Component
export function ParkingLotLineChart({ 
  data, 
  options = {}, 
  parkingLots = [] 
}: { 
  data?: any; 
  options?: ChartOptions<"line">;
  parkingLots?: Array<{name: string, revenue: number}>;
}) {
  // Default data if none provided
  const defaultData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Doanh thu 2023",
        data: [100, 120, 115, 134, 168, 180, 190, 185, 195, 210, 250, 270],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.3,
      },
      {
        label: "Doanh thu 2022",
        data: [90, 100, 95, 114, 148, 160, 170, 165, 175, 190, 220, 240],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.3,
      },
    ],
  };

  // Generate data from parking lots if provided
  const parkingLotsData = parkingLots.length > 0 ? {
    labels: parkingLots.map(lot => lot.name),
    datasets: [
      {
        label: "Doanh thu từ đầu năm đến nay",
        data: parkingLots.map(lot => lot.revenue),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.3,
      }
    ]
  } : null;

  return (
    <Line
      data={data || parkingLotsData || defaultData}
      options={{ ...defaultOptions, ...options }}
    />
  );
}

// Pie Chart Component
export function PieChart({ data, options = {} }: { data?: any; options?: ChartOptions<"pie"> }) {
  // Default data if none provided
  const defaultData = {
    labels: ["Hợp đồng", "Vãng lai", "Khác"],
    datasets: [
      {
        data: [70, 25, 5],
        backgroundColor: [
          "rgba(53, 162, 235, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 206, 86, 0.8)",
        ],
        borderColor: [
          "rgba(53, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Pie
      data={data || defaultData}
      options={{ ...defaultOptions, ...options }}
    />
  );
}
