// components/features/customers/EditCustomerForm.tsx
"use client";

import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Customer, UpdateCustomerPayload } from "@/types";

// Import Shadcn UI components & utils
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Schema based ONLY on UpdateCustomerRequest (no username/password)
const editCustomerSchema = z.object({
  firstName: z.string().min(1, "Bắt buộc").nullable(),
  lastName: z.string().min(1, "Bắt buộc").nullable(),
  phone: z.string().min(10, "Tối thiểu 10 số").nullable(),
  email: z.string().email("Email không hợp lệ").nullable(),
  isActive: z.boolean(),
});

// Type for form data matching the edit schema
type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

interface EditCustomerFormProps {
  // Handler passed from parent page
  onSubmitAction: SubmitHandler<EditCustomerFormData>;
  // Initial data for the customer being edited
  initialData: Customer;
  isSubmitting?: boolean;
  onCancelAction: () => void;
}

export function EditCustomerForm({
  onSubmitAction,
  initialData,
  isSubmitting = false,
  onCancelAction,
}: EditCustomerFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset, // Can be used to reset form state if needed
  } = useForm<EditCustomerFormData>({
    resolver: zodResolver(editCustomerSchema),
    // Set default values from the customer being edited
    defaultValues: {
      firstName: initialData?.firstName ?? null,
      lastName: initialData?.lastName ?? null,
      phone: initialData?.phone ?? null,
      email: initialData?.email ?? null,
      isActive: initialData?.isActive ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-4">
      {/* Grid layout for form fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="edit-firstName">Tên</Label>
          <Input id="edit-firstName" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="edit-lastName">Họ</Label>
          <Input id="edit-lastName" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="edit-email">Email</Label>
          <Input id="edit-email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="edit-phone">Số điện thoại</Label>
          <Input id="edit-phone" type="tel" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>
        {/* Username (Display Readonly - not editable via Update API) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="edit-username_display">Tên đăng nhập</Label>
          <Input
            id="edit-username_display"
            defaultValue={initialData.username || "N/A"}
            readOnly
            disabled
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>
        {/* Is Active Status */}
        <div className="space-y-2 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
          <Label htmlFor="edit-isActive" className="text-base">
            Đang hoạt động
          </Label>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch
                id="edit-isActive"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          {errors.isActive && (
            <p className="text-sm text-red-500">{errors.isActive.message}</p>
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
          {isSubmitting ? "Đang lưu..." : "Cập nhật khách hàng"}
        </Button>
      </div>
    </form>
  );
}
