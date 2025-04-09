// components/features/parking-lots/[lotId]/SpaceForm.tsx
"use client";
import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ParkingSpace } from "@/types"; // Import if needed for initialData
// Import relevant Payloads if defined separately
// import { AddSpacePayload, UpdateSpacePayload } from '@/lib/types';

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Schema based on AddSpaceRequest / UpdateSpaceRequest
// Status 0 = Available, 1 = Not Available
const spaceFormSchema = z.object({
  parkingSpaceName: z.string().min(1, "Space name/number is required."),
  // Using boolean for Switch, will convert to 0/1 on submit
  isAvailable: z.boolean().default(true),
});

// Type for form data matching the schema
type SpaceFormData = z.infer<typeof spaceFormSchema>;

interface SpaceFormProps {
  onSubmitAction: SubmitHandler<any>; // Accepts Add or Update payload structure after mapping
  initialData?: ParkingSpace | null; // For pre-filling in Edit mode
  isSubmitting?: boolean;
  onCancelAction: () => void;
}

export function SpaceForm({
  onSubmitAction,
  initialData,
  isSubmitting,
  onCancelAction,
}: SpaceFormProps) {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<SpaceFormData>({
    resolver: zodResolver(spaceFormSchema),
    defaultValues: {
      parkingSpaceName: initialData?.parkingSpaceName || "",
    },
  });

  // Wrapper to convert form data (boolean status) to API payload (number status)
  const processSubmit: SubmitHandler<SpaceFormData> = async (data) => {
    const apiPayload = {
      parkingSpaceName: data.parkingSpaceName,
      status: data.isAvailable ? 0 : 1, // Convert boolean back to 0 (Available) or 1 (Not Available)
      // Parent handler will add floorId (for add) or parkingSpaceId (for update)
    };
    await onSubmitAction(apiPayload);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      {/* Space Name */}
      <div>
        <Label htmlFor="parkingSpaceName">Space Name / Number *</Label>
        <Input id="parkingSpaceName" {...register("parkingSpaceName")} />
        {errors.parkingSpaceName && (
          <p className="text-sm text-red-500">
            {errors.parkingSpaceName.message}
          </p>
        )}
      </div>

      {/* Status Switch */}
      <div className="flex items-center space-x-2 pt-2">
        <Controller
          name="isAvailable"
          control={control}
          render={({ field }) => (
            <Switch
              id="space-status"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="space-status">Set as Available (Status 0)?</Label>
        {errors.isAvailable && (
          <p className="text-sm text-red-500">{errors.isAvailable.message}</p>
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
              ? "Update Space"
              : "Add Space"}
        </Button>
      </div>
    </form>
  );
}
