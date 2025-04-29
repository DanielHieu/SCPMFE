// components/features/parking-lots/ParkingLotForm.tsx
"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ParkingLot,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Use Textarea for address
import { cn } from "@/lib/utils";

// Schema based on Add/Update API request bodies (Address, Prices H/D/M, Lat/Long)
// --- UPDATED Schema using z.coerce.number() ---
const parkingLotSchema = z.object({
  parkingLotName: z.string().min(1, "Tên bãi đỗ xe là bắt buộc."),
  address: z.string().min(5, "Địa chỉ là bắt buộc (tối thiểu 5 ký tự)."),

  // Use z.coerce.number() for required number fields from string input
  pricePerHour: z.coerce
    .number({
      required_error: "Giá theo giờ là bắt buộc.", // Error if input is empty after coercion attempt fails
      invalid_type_error: "Giá theo giờ phải là số.", // Error if input cannot be coerced to number
    })
    .min(0, "Giá không thể là số âm."), // Apply number validations AFTER coercion

  pricePerDay: z.coerce
    .number({
      required_error: "Giá theo ngày là bắt buộc",
      invalid_type_error: "Phải là số",
    })
    .min(0, "Giá không thể là số âm."),

  pricePerMonth: z.coerce
    .number({
      required_error: "Giá theo tháng là bắt buộc",
      invalid_type_error: "Phải là số",
    })
    .min(0, "Giá không thể là số âm."),

  // For optional numbers, coerce then make optional/nullable
  lat: z.coerce
    .number({ invalid_type_error: "Vĩ độ phải là số." })
    .nullable() // Allow null
    .optional(), // Allow undefined / field to be missing

  long: z.coerce
    .number({ invalid_type_error: "Kinh độ phải là số." })
    .nullable()
    .optional(),
});

type ParkingLotFormData = z.infer<typeof parkingLotSchema>;

interface ParkingLotFormProps {
  onSubmitAction: SubmitHandler<any>; // Accepts Add or Update type (parent adds ID/ownerId)
  initialData?: ParkingLot | null;
  isSubmitting?: boolean;
  onCancelAction: () => void;
}

export function ParkingLotForm({
  onSubmitAction,
  initialData,
  isSubmitting,
  onCancelAction,
}: ParkingLotFormProps) {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParkingLotFormData>({
    resolver: zodResolver(parkingLotSchema),
    defaultValues: {
      parkingLotName: initialData?.parkingLotName || "",
      address: initialData?.address || "",
      // Format numbers back to strings for input defaultValue if needed, or rely on RHF defaults
      pricePerHour: initialData?.pricePerHour ?? undefined,
      pricePerDay: initialData?.pricePerDay ?? undefined,
      pricePerMonth: initialData?.pricePerMonth ?? undefined,
      lat: initialData?.lat ?? null,
      long: initialData?.long ?? null,
    },
  });
  console.log("Current Form Errors:", errors); // <<< ADD THIS LOG

  // Wrapper to ensure correct payload structure is passed to parent onSubmit
  const processSubmit: SubmitHandler<ParkingLotFormData> = async (data) => {
    // Parent component will add ownerId (for add) or parkingLotId (for update)
    console.log("--- Step 1: processSubmit in Form component called ---", data); // <<< ADD LOG
    await onSubmitAction(data);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      {/* Parking Lot Name */}
      <div className="space-y-2">
        <Label htmlFor="parkingLotName">Tên bãi đỗ xe *</Label>
        <Input id="parkingLotName" {...register("parkingLotName")} />
        {errors.parkingLotName && (
          <p className="text-sm text-red-500">{errors.parkingLotName.message}</p>
        )}
      </div>
      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ *</Label>
        <Textarea id="address" {...register("address")} />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>
      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="pricePerHour">Giá theo giờ (đ) *</Label>
          <Input
            id="pricePerHour"
            type="number"
            step="any"
            {...register("pricePerHour")}
          />
          {errors.pricePerHour && (
            <p className="text-xs text-red-500">
              {errors.pricePerHour.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="pricePerDay">Giá theo ngày (đ) *</Label>
          <Input
            id="pricePerDay"
            type="number"
            step="any"
            {...register("pricePerDay")}
          />
          {errors.pricePerDay && (
            <p className="text-xs text-red-500">{errors.pricePerDay.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="pricePerMonth">Giá theo tháng (đ) *</Label>
          <Input
            id="pricePerMonth"
            type="number"
            step="any"
            {...register("pricePerMonth")}
          />
          {errors.pricePerMonth && (
            <p className="text-xs text-red-500">
              {errors.pricePerMonth.message}
            </p>
          )}
        </div>
      </div>
      {/* Lat/Long */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lat">Vĩ độ</Label>
          <Input id="lat" type="number" step="any" {...register("lat")} />
          {errors.lat && (
            <p className="text-xs text-red-500">{errors.lat.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="long">Kinh độ</Label>
          <Input id="long" type="number" step="any" {...register("long")} />
          {errors.long && (
            <p className="text-xs text-red-500">{errors.long.message}</p>
          )}
        </div>
      </div>
      {/* Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancelAction}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Đang lưu..."
            : isEditMode
              ? "Cập nhật bãi đỗ xe"
              : "Tạo bãi đỗ xe"}
        </Button>
      </div>
    </form>
  );
}
