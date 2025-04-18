// components/features/staff/StaffForm.tsx
"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import UI components, cn utility...
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Staff, AddStaffPayload, UpdateStaffPayload } from "@/types"; // Import Staff type

// Schema for adding new staff
const addStaffSchema = z.object({
  firstName: z.string().min(1, "Bắt buộc"),
  lastName: z.string().min(1, "Bắt buộc"),
  phone: z.string().min(10, "Tối thiểu 10 số"),
  email: z.string().email("Email không hợp lệ"),
  username: z.string().min(1, "Bắt buộc").max(50),
  password: z.string().min(6, "Tối thiểu 6 ký tự").max(100),
  isActive: z.boolean().default(true),
});

// Schema for updating existing staff
const updateStaffSchema = z.object({
  firstName: z.string().min(1, "Bắt buộc"),
  lastName: z.string().min(1, "Bắt buộc"),
  phone: z.string().min(10, "Tối thiểu 10 số"),
  email: z.string().email("Email không hợp lệ"),
  isActive: z.boolean().default(true),
});

type StaffFormData = z.infer<typeof addStaffSchema>;
type UpdateFormData = z.infer<typeof updateStaffSchema>;

interface StaffFormProps {
  onSubmitAction: SubmitHandler<any>;
  initialData?: Staff | null;
  isSubmitting?: boolean;
  className?: string;
  onCancelAction?: () => void;
}

export function StaffForm({
  onSubmitAction,
  initialData = null,
  isSubmitting = false,
  className,
  onCancelAction,
}: StaffFormProps) {
  // Use the appropriate schema based on whether we're editing or adding
  const schema = initialData ? updateStaffSchema : addStaffSchema;
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        phone: initialData.phone,
        email: initialData.email,
        isActive: initialData.isActive,
      }
      : {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        username: '',
        isActive: true,
        password: ''
      },
  });

  useEffect(() => {
    if (initialData) {
      // Reset with initial data when editing
      reset({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        phone: initialData.phone,
        email: initialData.email,
        isActive: initialData.isActive,
      });
    } else {
      // Reset to defaults when adding (or when initialData becomes null)
      reset({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        username: '',
        isActive: true,
        password: ''
      });
    }
  }, [initialData, reset]);


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
        <Label htmlFor="firstName">Tên</Label>
        <Input id="firstName" {...register("firstName")} />
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName.message as string}</p>
        )}
      </div>
      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastName">Họ</Label>
        <Input id="lastName" {...register("lastName")} />
        {errors.lastName && (
          <p className="text-sm text-red-500">{errors.lastName.message as string}</p>
        )}
      </div>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message as string}</p>
        )}
      </div>
      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" type="tel" {...register("phone")} />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message as string}</p>
        )}
      </div>
      {/* Username - Only show when adding new staff */}
      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="username">Tên đăng nhập</Label>
          <Input id="username" {...register("username")} />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message as string}</p>
          )}
        </div>
      )}
      {/* Password - Only show when adding new staff */}
      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message as string}</p>
          )}
        </div>
      )}
      {/* Is Active Status */}
      <div className="space-y-2 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
        <Label htmlFor="isActive" className="text-base">
          Đặt trạng thái hoạt động
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
          <p className="text-sm text-red-500">{errors.isActive.message as string}</p>
        )}
      </div>
      {/* Buttons */}
      <div className="md:col-span-2 flex justify-end pt-4 gap-3">
        {onCancelAction && ( // Conditionally render cancel button
          <Button type="button" variant="outline" onClick={onCancelAction} disabled={isSubmitting}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (initialData ? "Đang cập nhật..." : "Đang thêm...") : (initialData ? "Cập nhật nhân viên" : "Thêm nhân viên")}
        </Button>
      </div>
    </form>
  );
}
