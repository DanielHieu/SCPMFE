// components/features/staff/StaffForm.tsx
"use client";

import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import UI components, cn utility...
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Schema based on RegisterStaffRequest [cite: 243]
const staffFormSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z.string().min(10, "Min 10 digits"),
  email: z.string().email("Invalid email"),
  username: z.string().min(1, "Required").max(50),
  password: z.string().min(6, "Min 6 chars").max(100),
  isActive: z.boolean().default(true), // Matches 'isActive' in schema [cite: 243]
});

// Form data type (excluding ownerId)
type StaffFormData = z.infer<typeof staffFormSchema>;

interface StaffFormProps {
  onSubmitAction: SubmitHandler<StaffFormData>;
  isSubmitting?: boolean;
  className?: string;
}

export function StaffForm({
  onSubmitAction,
  isSubmitting = false,
  className,
}: StaffFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { isActive: true, phone: "", email: "" }, // Provide sensible defaults
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmitAction)}
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6",
        className,
      )}
    >
      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input id="firstName" {...register("firstName")} />
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName.message}</p>
        )}
      </div>
      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input id="lastName" {...register("lastName")} />
        {errors.lastName && (
          <p className="text-sm text-red-500">{errors.lastName.message}</p>
        )}
      </div>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" {...register("phone")} />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register("username")} />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>
      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      {/* Is Active Status */}
      <div className="space-y-2 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
        <Label htmlFor="isActive" className="text-base">
          Set Status to Active
        </Label>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch
              id="isActive"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        {errors.isActive && (
          <p className="text-sm text-red-500">{errors.isActive.message}</p>
        )}
      </div>
      {/* Submit Button */}
      <div className="md:col-span-2 flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Staff Member"}
        </Button>
      </div>
    </form>
  );
}
