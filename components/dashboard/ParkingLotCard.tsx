"use client";

import React from "react";
import { ParkingLotSummary, ParkingLotStatus } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Import Progress
import { MapPin, DollarSign, CircleCheck, CircleX, CircleDot, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

interface ParkingLotCardProps {
  lot: ParkingLotSummary;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); // Adjust locale and currency as needed
};

// Helper to get status styles
const getStatusStyles = (status: ParkingLotStatus): { className: string; icon: React.ReactNode } => {
  switch (status) {
    case "Open":
      return { className: "bg-green-100 text-green-800 border-green-300", icon: <CircleCheck className="h-3 w-3 mr-1" /> };
    case "Full":
      return { className: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: <CircleDot className="h-3 w-3 mr-1" /> };
    case "Closed":
      return { className: "bg-red-100 text-red-800 border-red-300", icon: <CircleX className="h-3 w-3 mr-1" /> };
    default:
      return { className: "bg-gray-100 text-gray-800 border-gray-300", icon: <CircleDot className="h-3 w-3 mr-1" /> };
  }
};

export function ParkingLotCard({ lot }: ParkingLotCardProps) {
  const availableSlots = lot.totalSlots - lot.occupiedSlots;
  const occupancyPercentage = lot.totalSlots > 0 ? (lot.occupiedSlots / lot.totalSlots) * 100 : 0;
  const statusStyles = getStatusStyles(lot.status);

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow duration-300 border border-border/40">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg mb-1">{lot.name}</CardTitle>
            <CardDescription className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {lot.location}
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn("text-xs flex items-center", statusStyles.className)}>
            {statusStyles.icon}
            {lot.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {/* Occupancy Info */}
        <div>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-medium">Occupancy</span>
            <span className="text-muted-foreground">
              <span className={cn("font-semibold", availableSlots > 0 ? "text-green-600" : "text-red-600")}>
                {availableSlots}
              </span> / {lot.totalSlots} Available
            </span>
          </div>
          <Progress value={occupancyPercentage} aria-label={`${occupancyPercentage.toFixed(0)}% Occupied`} className="h-2" />
          <div className="text-right text-xs text-muted-foreground mt-1">
            {lot.occupiedSlots} Occupied ({occupancyPercentage.toFixed(0)}%)
          </div>
        </div>

        {/* Revenue Info */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/30">
          <span className="font-medium text-muted-foreground flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Revenue (YTD)
          </span>
          <span className="font-semibold text-primary">
            {formatCurrency(lot.revenueYTD)}
          </span>
        </div>

        {/* Optional: Sparkline could go here */}

      </CardContent>
      <CardFooter className="pt-3 border-t border-border/30">
        <Link href={`/parking-lots/${lot.id}`} passHref className="w-full">
          <Button variant="outline" size="sm" className="w-full hover:bg-accent hover:text-accent-foreground">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 