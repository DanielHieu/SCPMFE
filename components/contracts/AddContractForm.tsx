// components/features/contracts/AddContractForm.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Car,
  ParkingLot,
  Area,
  Floor,
  ParkingSpace,
  AddContractPayload,
} from "@/types";
import {
  searchParkingLots, // Using search instead of getParkingLots
  getAreasByLot,
  getFloorsByArea,
  getParkingSpacesByFloor,
} from "@/lib/api";

// Import Shadcn UI components & utils
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Zod Schema for the form's fields
const addContractFormSchema = z.object({
  parkingLotId: z.string().min(1, "Required"),
  areaId: z.string().min(1, "Required"),
  floorId: z.string().min(1, "Required"),
  parkingSpaceId: z.string().min(1, "Parking Space is required."), // Final selection needed for API
  carId: z.string().min(1, "Associated Vehicle is required."),
  durationMonths: z.number().min(1, "Min 1 month"),
  startDate: z.date({ required_error: "Start date is required." }),
  monthlyRate: z.number().min(1, "Monthly rate required"),
});

// Type for form data
type AddContractFormData = z.infer<typeof addContractFormSchema>;

// Props expected by the component
interface AddContractFormProps {
  customerId: number;
  customerName: string;
  customerVehicles: Car[]; // Pass customer's vehicles
  onSubmitAction: (payload: AddContractPayload) => Promise<void>; // Parent handles API call
  onCancelAction: () => void; // Parent handles closing the modal
}

export function AddContractForm({
  customerId,
  customerName,
  customerVehicles,
  onSubmitAction,
  onCancelAction,
}: AddContractFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for dropdown options
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  // State for loading indicators
  const [isLoadingLots, setIsLoadingLots] = useState(true);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors },
  } = useForm<AddContractFormData>({
    resolver: zodResolver(addContractFormSchema),
    defaultValues: {
      durationMonths: 1,
      parkingLotId: "",
      areaId: "",
      floorId: "",
      parkingSpaceId: "",
      carId: "",
    },
  });

  // Watch selections to trigger dependent fetches/calculations
  const selectedLotId = watch("parkingLotId");
  const selectedAreaId = watch("areaId");
  const selectedFloorId = watch("floorId");
  const monthlyRate = watch("monthlyRate");
  const durationMonths = watch("durationMonths");

  // --- Data Fetching Effects ---
  useEffect(() => {
    // Fetch Parking Lots on Mount
    setIsLoadingLots(true);
    searchParkingLots(null) // Assuming null/empty search gets all lots
      .then((data) => setParkingLots(data || []))
      .catch((error) => console.error("Failed fetch lots:", error))
      .finally(() => setIsLoadingLots(false));
  }, []);

  useEffect(() => {
    // Fetch Areas when Lot changes
    setAreas([]);
    setFloors([]);
    setParkingSpaces([]);
    resetField("areaId");
    resetField("floorId");
    resetField("parkingSpaceId");
    if (!selectedLotId) return;
    setIsLoadingAreas(true);
    getAreasByLot(selectedLotId)
      .then((data) => setAreas(data || []))
      .catch((error) => console.error("Failed fetch areas:", error))
      .finally(() => setIsLoadingAreas(false));
  }, [selectedLotId, resetField]);

  useEffect(() => {
    // Fetch Floors when Area changes
    setFloors([]);
    setParkingSpaces([]);
    resetField("floorId");
    resetField("parkingSpaceId");
    if (!selectedAreaId) return;
    setIsLoadingFloors(true);
    getFloorsByArea(selectedAreaId)
      .then((data) => setFloors(data || []))
      .catch((error) => console.error("Failed fetch floors:", error))
      .finally(() => setIsLoadingFloors(false));
  }, [selectedAreaId, resetField]);

  useEffect(() => {
    // Fetch Spaces when Floor changes
    setParkingSpaces([]);
    resetField("parkingSpaceId");
    if (!selectedFloorId) return;
    setIsLoadingSpaces(true);
    getParkingSpacesByFloor(selectedFloorId)
      .then((data) => setParkingSpaces(data || []))
      .catch((error) => console.error("Failed fetch spaces:", error))
      .finally(() => setIsLoadingSpaces(false));
  }, [selectedFloorId, resetField]);

  // --- Calculate Total Cost ---
  const totalUpfrontCost = useMemo(() => {
    const rate = Number(monthlyRate) || 0;
    const duration = Number(durationMonths) || 0;
    return rate * duration;
  }, [monthlyRate, durationMonths]);

  // --- Form Submission Handler ---
  const processSubmit: SubmitHandler<AddContractFormData> = async (data) => {
    setIsSubmitting(true);
    const startDate = data.startDate;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + data.durationMonths);
    const pendingPaymentStatus = 1; // ** Assumed status code for Pending Payment **

    // Construct payload for POST /api/Contract/AddContract API [cite: uploaded:API-docsc.txt, 213]
    const apiPayload: AddContractPayload = {
      carId: parseInt(data.carId, 10),
      parkingSpaceId: parseInt(data.parkingSpaceId, 10),
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      status: pendingPaymentStatus,
      note: `Rate: ${data.monthlyRate}, Duration: ${data.durationMonths} months`,
    };

    try {
      await onSubmitAction(apiPayload);
    } finally {
      // Call parent handler
      setIsSubmitting(false);
    }
  };

  // --- Render Form ---
  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      {/* Customer Display (Readonly) */}
      <div>
        <Label>Customer</Label>
        <Input
          value={`${customerName} (ID: CUST-${customerId})`}
          readOnly
          disabled
          className="bg-gray-100"
        />
      </div>

      {/* Dependent Selects Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Parking Lot */}
        <div>
          <Label htmlFor="parkingLotId">Parking Lot *</Label>
          <Controller
            name="parkingLotId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoadingLots}
              >
                <SelectTrigger id="parkingLotId">
                  <SelectValue
                    placeholder={
                      isLoadingLots ? "Loading..." : "-- Select Lot --"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {parkingLots.map((lot) => (
                    <SelectItem
                      key={lot.parkingLotId}
                      value={String(lot.parkingLotId)}
                    >
                      {lot.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.parkingLotId && (
            <p className="mt-1 text-xs text-red-500">
              {errors.parkingLotId.message}
            </p>
          )}
        </div>
        {/* Area */}
        <div>
          <Label htmlFor="areaId">Area *</Label>
          <Controller
            name="areaId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={
                  !selectedLotId || isLoadingAreas || areas.length === 0
                }
              >
                <SelectTrigger id="areaId">
                  <SelectValue
                    placeholder={
                      !selectedLotId
                        ? "-- Select Lot First --"
                        : isLoadingAreas
                          ? "Loading..."
                          : areas.length === 0
                            ? "No Areas"
                            : "-- Select Area --"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.areaId} value={String(area.areaId)}>
                      {area.areaName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.areaId && (
            <p className="mt-1 text-xs text-red-500">{errors.areaId.message}</p>
          )}
        </div>
        {/* Floor */}
        <div>
          <Label htmlFor="floorId">Floor *</Label>
          <Controller
            name="floorId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={
                  !selectedAreaId || isLoadingFloors || floors.length === 0
                }
              >
                <SelectTrigger id="floorId">
                  <SelectValue
                    placeholder={
                      !selectedAreaId
                        ? "-- Select Area First --"
                        : isLoadingFloors
                          ? "Loading..."
                          : floors.length === 0
                            ? "No Floors"
                            : "-- Select Floor --"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem
                      key={floor.floorId}
                      value={String(floor.floorId)}
                    >
                      {floor.floorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.floorId && (
            <p className="mt-1 text-xs text-red-500">
              {errors.floorId.message}
            </p>
          )}
        </div>
        {/* Parking Space */}
        <div>
          <Label htmlFor="parkingSpaceId">Parking Space *</Label>
          <Controller
            name="parkingSpaceId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={
                  !selectedFloorId ||
                  isLoadingSpaces ||
                  parkingSpaces.length === 0
                }
              >
                <SelectTrigger id="parkingSpaceId">
                  <SelectValue
                    placeholder={
                      !selectedFloorId
                        ? "-- Select Floor First --"
                        : isLoadingSpaces
                          ? "Loading..."
                          : parkingSpaces.length === 0
                            ? "No Spaces"
                            : "-- Select Space --"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {parkingSpaces.map((space) => (
                    <SelectItem
                      key={space.parkingSpaceId}
                      value={String(space.parkingSpaceId)}
                    >
                      {space.parkingSpaceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.parkingSpaceId && (
            <p className="mt-1 text-xs text-red-500">
              {errors.parkingSpaceId.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Available slots appear after selecting lot/area/floor.
          </p>
        </div>
      </div>

      {/* Vehicle Select & Duration Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Associated Vehicle */}
        <div>
          <Label htmlFor="carId">Associated Vehicle *</Label>
          <Controller
            name="carId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!customerVehicles || customerVehicles.length === 0}
              >
                <SelectTrigger id="carId">
                  <SelectValue
                    placeholder={
                      !customerVehicles || customerVehicles.length === 0
                        ? "No vehicles found"
                        : "-- Select Vehicle --"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {customerVehicles?.map((v) => (
                    <SelectItem key={v.carId} value={String(v.carId)}>
                      {v.licensePlate} ({v.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.carId && (
            <p className="mt-1 text-xs text-red-500">{errors.carId.message}</p>
          )}
        </div>
        {/* Duration */}
        <div>
          <Label htmlFor="durationMonths">Duration (Months) *</Label>
          <Input
            id="durationMonths"
            type="number"
            min="1"
            {...register("durationMonths", { valueAsNumber: true })}
            placeholder="e.g., 1, 3, 6, 12"
          />
          {errors.durationMonths && (
            <p className="mt-1 text-xs text-red-500">
              {errors.durationMonths.message}
            </p>
          )}
        </div>
      </div>

      {/* Start Date & Monthly Rate Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Start Date */}
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
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
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-500">
              {errors.startDate.message}
            </p>
          )}
        </div>
        {/* Monthly Rate */}
        <div>
          <Label htmlFor="monthlyRate">Monthly Rate (VND) *</Label>
          <Input
            id="monthlyRate"
            type="number"
            min="0"
            {...register("monthlyRate", { valueAsNumber: true })}
            placeholder="e.g., 2500000"
          />
          {errors.monthlyRate && (
            <p className="mt-1 text-xs text-red-500">
              {errors.monthlyRate.message}
            </p>
          )}
        </div>
      </div>

      {/* Calculated Cost Display */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-center mt-2">
        <p className="text-sm text-blue-700 font-medium">Total Upfront Cost:</p>
        <p className="text-lg font-semibold text-blue-900">
          {totalUpfrontCost.toLocaleString("vi-VN")} VND
        </p>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Total cost is calculated from Monthly Rate × Duration. Contract status
        will be 'Pending Payment' upon creation.
      </p>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancelAction}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Contract & Await Payment"}
        </Button>
      </div>
    </form>
  );
}
