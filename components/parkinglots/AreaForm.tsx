// components/features/parking-lots/[lotId]/AreaForm.tsx
"use client";

import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AddAreaPayload } from "@/types"; // Import if defined separately
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For Status/RentalType
import { cn } from "@/lib/utils";

// Schema based on AddAreaRequest (parkingLotId added by parent)
const areaFormSchema = z.object({
  areaName: z.string().min(1, "Area name is required."),
  // Assuming status and rentalType are represented by numbers based on schema format 'int32'
  status: z.preprocess(Number, z.number({ required_error: "Status required" })), // Coerce string from Select to number
  rentalType: z.preprocess(
    Number,
    z.number({ required_error: "Rental Type required" }),
  ), // Coerce string from Select to number
});

// Type for form data matching the schema
type AreaFormData = z.infer<typeof areaFormSchema>;

interface AreaFormProps {
  onSubmitAction: SubmitHandler<AreaFormData>; // Parent handles adding parkingLotId
  initialData?: Partial<AreaFormData>; // For Edit mode later
  isSubmitting?: boolean;
  onCancelAction: () => void;
}

// TODO: Define options for Status and Rental Type based on backend meaning
const STATUS_OPTIONS = [
  { value: 1, label: "Active" },
  { value: 0, label: "Inactive" },
];
const RENTAL_TYPE_OPTIONS = [
  { value: 1, label: "Contract" },
  { value: 2, label: "Walking" },
];

export function AreaForm({
  onSubmitAction,
  initialData,
  isSubmitting,
  onCancelAction,
}: AreaFormProps) {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AreaFormData>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: initialData || { status: 1, rentalType: 1 }, // Default to 'Active' / 'Standard'
  });

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-4">
      <div>
        <Label htmlFor="areaName">Area Name *</Label>
        <Input id="areaName" {...register("areaName")} />
        {errors.areaName && (
          <p className="text-sm text-red-500">{errors.areaName.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status *</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="rentalType">Rental Type *</Label>
          <Controller
            name="rentalType"
            control={control}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id="rentalType">
                  <SelectValue placeholder="Select Rental Type" />
                </SelectTrigger>
                <SelectContent>
                  {RENTAL_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.rentalType && (
            <p className="mt-1 text-xs text-red-500">
              {errors.rentalType.message}
            </p>
          )}
        </div>
      </div>
      {/* Add other fields if needed based on API/UI refinement */}
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
          {isSubmitting ? "Saving..." : isEditMode ? "Update Area" : "Add Area"}
        </Button>
      </div>
    </form>
  );
}
