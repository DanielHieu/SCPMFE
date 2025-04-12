// components/features/parking-lots/[lotId]/PriceInfoCard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarDays, Calendar } from "lucide-react"; // Example icons

interface PriceInfoCardProps {
  pricePerHour: number | null;
  pricePerDay: number | null;
  pricePerMonth: number | null;
}

// Helper function (move to utils)
const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "0 ₫";
  // Format as VND with symbol after the amount
  return `${value.toLocaleString('vi-VN')} ₫`;
};

export function PriceInfoCard({
  pricePerHour,
  pricePerDay,
  pricePerMonth,
}: PriceInfoCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-xl mr-2 text-muted-foreground">₫</span> Giá gửi xe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Giá theo giờ</span>
          </div>
          <span className="font-medium">{formatCurrency(pricePerHour)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Giá theo ngày</span>
          </div>
          <span className="font-medium">{formatCurrency(pricePerDay)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Giá theo tháng</span>
          </div>
          <span className="font-medium">{formatCurrency(pricePerMonth)}</span>
        </div>
        {/* Yearly price ignored as per API data */}
      </CardContent>
    </Card>
  );
}
