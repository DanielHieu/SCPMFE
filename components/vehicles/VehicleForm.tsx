"use client";

import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Car } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const vehicleFormSchema = z.object({
  model: z.string().min(1, "Model is required."),
  color: z.string().min(1, "Color is required.").nullable(),
  licensePlate: z.string().min(3, "License Plate required.").nullable(),
  registedDate: z.date({ required_error: "Registration date required." }),
  status: z.boolean().default(true),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  onSubmitAction: SubmitHandler<any>;
  initialData?: Car | null;
  isSubmitting?: boolean;
  onCancelAction: () => void;
}

export function VehicleForm({
  onSubmitAction,
  initialData,
  isSubmitting = false,
  onCancelAction,
}: VehicleFormProps) {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: isEditMode
      ? {
          model: initialData?.model || "",
          color: initialData?.color || null,
          licensePlate: initialData?.licensePlate || null,
          registedDate: initialData?.registeredDate
            ? new Date(initialData.registeredDate)
            : undefined,
          status: initialData?.status ?? true,
        }
      : {
          status: true, // Default for add
          model: "",
          color: null,
          licensePlate: null,
          registedDate: undefined,
        },
  });

  // Wrapper to ensure correct payload structure is passed to parent onSubmit
  const processSubmit: SubmitHandler<VehicleFormData> = async (data) => {
    // Parent component will handle adding customerId/carId to the payload
    // Format date before sending
    const payload = {
      ...data,
      registedDate: format(data.registedDate, "yyyy-MM-dd"), // Format for API
    };
    await onSubmitAction(payload); // Pass formatted data to parent handler
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="model">Model *</Label>
        <Input id="model" {...register("model")} />
        {errors.model && (
          <p className="text-sm text-red-500">{errors.model.message}</p>
        )}
      </div>
      {/* Color */}
      <div>
        <Label htmlFor="color">Color</Label>
        <Input id="color" {...register("color")} />
        {errors.color && (
          <p className="text-sm text-red-500">{errors.color.message}</p>
        )}
      </div>
      {/* License Plate */}
      <div>
        <Label htmlFor="licensePlate">License Plate *</Label>
        <Input id="licensePlate" {...register("licensePlate")} />
        {errors.licensePlate && (
          <p className="text-sm text-red-500">{errors.licensePlate.message}</p>
        )}
      </div>
      {/* Registration Date */}
      <div>
        <Label htmlFor="registedDate">Registration Date *</Label>
        <Controller
          name="registedDate"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="registedDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.registedDate && (
          <p className="mt-1 text-xs text-red-500">
            {errors.registedDate.message}
          </p>
        )}
      </div>
      {/* Status */}
      <div className="flex items-center space-x-2">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Switch
              id="status"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="status">Active</Label>
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
              ? "Update Vehicle"
              : "Add Vehicle"}
        </Button>
      </div>
    </form>
  );
}
