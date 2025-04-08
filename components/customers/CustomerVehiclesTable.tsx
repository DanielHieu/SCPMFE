// components/features/customers/CustomerVehiclesTable.tsx
"use client";
import React from "react";
import { Car } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { 
  Edit, 
  MoreHorizontal, 
  PlusCircle, 
  Trash2, 
  Calendar, 
  Car as CarIcon, 
  Palette, 
  FileText 
} from "lucide-react";
import { format } from "date-fns";

interface CustomerVehiclesTableProps {
  vehicles: Car[];
  onAddClickAction: () => void;
  onEditClickAction: (vehicle: Car) => void;
  onDeleteClickAction: (vehicle: number) => void;
}

export function CustomerVehiclesTable({
  vehicles,
  onAddClickAction,
  onEditClickAction,
  onDeleteClickAction,
}: CustomerVehiclesTableProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Phương tiện đã đăng ký
        </CardTitle>
        <Button size="sm" variant="outline" onClick={onAddClickAction}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Thêm xe
        </Button>
      </CardHeader>
      <CardContent>
        {vehicles && vehicles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {vehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.carId} 
                vehicle={vehicle} 
                onEditClick={() => onEditClickAction(vehicle)}
                onDeleteClick={() => onDeleteClickAction(vehicle.carId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Không tìm thấy phương tiện nào.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4" 
              onClick={onAddClickAction}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Thêm xe đầu tiên
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VehicleCardProps {
  vehicle: Car;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

function VehicleCard({ vehicle, onEditClick, onDeleteClick }: VehicleCardProps) {
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
          <div className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {vehicle.registeredDate 
                ? format(new Date(vehicle.registeredDate), "dd/MM/yyyy")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="border-t p-2 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditClick} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteClick} className="cursor-pointer text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
