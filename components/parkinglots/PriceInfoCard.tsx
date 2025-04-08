// components/features/parking-lots/[lotId]/PriceInfoCard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, CalendarDays, Calendar } from "lucide-react"; // Example icons

interface PriceInfoCardProps {
  pricePerHour?: number | null;
  pricePerDay?: number | null;
  pricePerMonth?: number | null;
}

// Helper function (move to utils)
const formatCurrency = (value: number | null | undefined) => {
  if (value == null) return "N/A";
  // Adjust currency formatting as needed (e.g., VND)
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" }); // Example USD
};

export function PriceInfoCard({
  pricePerHour,
  pricePerDay,
  pricePerMonth,
}: PriceInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-muted-foreground" /> Parking
          Price
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center text-muted-foreground">
            <Clock size={16} className="mr-2" />
            Hourly
          </span>
          <span className="font-medium">{formatCurrency(pricePerHour)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center text-muted-foreground">
            <CalendarDays size={16} className="mr-2" />
            Daily Max
          </span>
          <span className="font-medium">{formatCurrency(pricePerDay)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center text-muted-foreground">
            <Calendar size={16} className="mr-2" />
            Monthly
          </span>
          <span className="font-medium">{formatCurrency(pricePerMonth)}</span>
        </div>
        {/* Yearly price ignored as per API data */}
      </CardContent>
    </Card>
  );
}
