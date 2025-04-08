// components/features/parking-lots/[lotId]/FloorForm.tsx
"use client";

import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Floor } from "@/types"; // Import Floor type if needed for initialData type check
// Import relevant Payloads if defined separately
// import { AddFloorPayload, UpdateFloorPayload } from '@/lib/types';

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Schema based on AddFloorRequest / UpdateFloorRequest
// Assuming status 1 = Active, 0 = Inactive (Please CONFIRM this mapping)
const floorFormSchema = z.object({
  floorName: z.string().min(1, "Floor name is required."),
  status: z.boolean().default(true), // Use boolean for Switch, convert to number on submit
});

// Type for form data matching the schema
type FloorFormData = z.infer<typeof floorFormSchema>;

interface FloorFormProps {
  onSubmitAction: SubmitHandler<any>; // Accepts Add or Update payload structure after mapping
  initialData?: Floor | null; // For pre-filling in Edit mode
  isSubmitting?: boolean;
  onCancelAction: () => void;
}

export function FloorForm({
  onSubmitAction,
  initialData,
  isSubmitting,
  onCancelAction,
}: FloorFormProps) {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FloorFormData>({
    resolver: zodResolver(floorFormSchema),
    defaultValues: {
      floorName: initialData?.floorName || "",
      // Convert status number (e.g., 1) from API to boolean for Switch
      status: initialData ? initialData.status === 1 : true, // Assume 1 is Active/true
    },
  });

  // Wrapper to convert form data (boolean status) to API payload (number status)
  const processSubmit: SubmitHandler<FloorFormData> = async (data) => {
    const apiPayload = {
      floorName: data.floorName,
      status: data.status ? 1 : 0, // Convert boolean back to 1 (Active) or 0 (Inactive) - ADJUST IF NEEDED
      // Parent handler will add areaId (for add) or floorId (for update)
    };
    await onSubmitAction(apiPayload);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      {/* Floor Name */}
      <div>
        <Label htmlFor="floorName">Floor Name / Number *</Label>
        <Input id="floorName" {...register("floorName")} />
        {errors.floorName && (
          <p className="text-sm text-red-500">{errors.floorName.message}</p>
        )}
      </div>

      {/* Status Switch */}
      <div className="flex items-center space-x-2 pt-2">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Switch
              id="floor-status"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="floor-status">Set as Active (Status 1)?</Label>
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancelAction}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditMode
              ? "Update Floor"
              : "Add Floor"}
        </Button>
      </div>
    </form>
  );
}
