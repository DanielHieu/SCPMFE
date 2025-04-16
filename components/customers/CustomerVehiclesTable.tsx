// components/features/customers/CustomerVehiclesTable.tsx
"use client";
import React from "react";
import { Car } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car as CarIcon,
  Palette,
  FileText
} from "lucide-react";

interface CustomerVehiclesTableProps {
  vehicles: Car[]
}

export function CustomerVehiclesTable({
  vehicles
}: CustomerVehiclesTableProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Phương tiện đã đăng ký
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vehicles && vehicles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.carId}
                vehicle={vehicle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Không tìm thấy phương tiện nào.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VehicleCardProps {
  vehicle: Car;
}

function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="bg-muted/30 rounded-lg border overflow-hidden hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-all duration-200 group-hover:bg-primary/20">
            <CarIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{vehicle.model}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>{vehicle.licensePlate || "N/A"}</span>
            </div>
          </div>
        </div>
        <Badge variant={vehicle.status ? "default" : "outline"}>
          {vehicle.status ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      </div>

      <div className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <Palette className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{vehicle.color || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
