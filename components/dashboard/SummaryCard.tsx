"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Assuming you have a utility for classnames

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export function SummaryCard({ title, value, icon, className, valueClassName }: SummaryCardProps) {
  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow border-l-4", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
        {/* Optional: Add description or trend indicator here */}
      </CardContent>
    </Card>
  );
} 