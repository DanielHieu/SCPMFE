// components/features/parking-lots/[lotId]/ParkingLotHeaderInfo.tsx
import React from "react";
import { MapPin } from "lucide-react";

interface ParkingLotHeaderInfoProps {
  address: string;
  lat?: number | null;
  long?: number | null;
}

export function ParkingLotHeaderInfo({
  address,
  lat,
  long,
}: ParkingLotHeaderInfoProps) {
  // Use address as the main title if name isn't available
  const title = address; // Or potentially extract first part of address

  return (
    <div className="space-y-1 px-1">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="text-sm text-muted-foreground">{address}</p>
      {lat && long && (
        <p className="text-xs text-muted-foreground flex items-center">
          <MapPin size={12} className="mr-1" /> GPS: {lat.toFixed(6)},{" "}
          {long.toFixed(6)}
        </p>
      )}
    </div>
  );
}
