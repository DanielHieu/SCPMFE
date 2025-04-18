// components/features/staff/[staffId]/EditableStaffInfoCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Staff, UpdateStaffPayload } from "@/types"; // Import types
import { updateStaff } from "@/lib/api"; // Import API function
import { toast } from "sonner";

// Import UI components & utils
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Mail, Phone, User, Edit } from "lucide-react";

// Schema based on UpdateStaffRequest
const updateStaffSchema = z.object({
  firstName: z.string().min(1, "Required").nullable(),
  lastName: z.string().min(1, "Required").nullable(),
  phone: z.string().min(10, "Min 10 digits").nullable(),
  email: z.string().email("Invalid email").nullable(),
  // isActive is handled separately in the main page
});

type UpdateStaffFormData = z.infer<typeof updateStaffSchema>;

interface EditableStaffInfoCardProps {
  initialData: Staff;
}

export function EditableStaffInfoCard({
  initialData
}: EditableStaffInfoCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateStaffFormData>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
      firstName: initialData?.firstName ?? null,
      lastName: initialData?.lastName ?? null,
      phone: initialData?.phone ?? null,
      email: initialData?.email ?? null,
    },
  });

  // Update local state if initialData prop changes
  useEffect(() => {
    reset({
      // Reset form when initial data changes
      firstName: initialData?.firstName ?? null,
      lastName: initialData?.lastName ?? null,
      phone: initialData?.phone ?? null,
      email: initialData?.email ?? null,
    });
  }, [initialData, reset]);

  // Handler for form submission
  const onSubmitInfo: SubmitHandler<UpdateStaffFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload: UpdateStaffPayload = {
        staffId: initialData.staffId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        isActive: initialData.isActive
      };

      await updateStaff(payload);

      toast.success("Staff details updated");

      setIsEditing(false);

    } catch (error) {
      toast.error(`Update failed: ${error}`);

    } finally {
      setIsSubmitting(false);
    }
  };

  // Base classes for inputs
  const inputBaseClasses = "border-0 bg-transparent shadow-none px-3 py-2 h-auto";
  const editableClasses = "focus:bg-muted/50 focus-visible:ring-1 focus-visible:ring-offset-0";

  if (!isEditing) {
    return (
      <div className="p-4 divide-y">
        <div className="py-3 flex items-start justify-between">
          <div className="space-y-4">
            <InfoItem
              icon={<User className="h-4 w-4 text-muted-foreground" />}
              label="Họ và tên"
              value={`${initialData.firstName} ${initialData.lastName}`}
            />

            <InfoItem
              icon={<Mail className="h-4 w-4 text-muted-foreground" />}
              label="Email"
              value={initialData.email}
            />

            <InfoItem
              icon={<Phone className="h-4 w-4 text-muted-foreground" />}
              label="Số điện thoại"
              value={initialData.phone}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitInfo)} className="p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1">
            <Label htmlFor="staff-firstName" className="text-xs font-medium text-muted-foreground">
              Họ
            </Label>
            <Input
              id="staff-firstName"
              {...register("firstName")}
              className={cn(inputBaseClasses, editableClasses)}
              placeholder="First Name"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <Label htmlFor="staff-lastName" className="text-xs font-medium text-muted-foreground">
              Tên
            </Label>
            <Input
              id="staff-lastName"
              {...register("lastName")}
              className={cn(inputBaseClasses, editableClasses)}
              placeholder="Last Name"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="staff-email" className="text-xs font-medium text-muted-foreground">
            Email
          </Label>
          <Input
            id="staff-email"
            type="email"
            {...register("email")}
            className={cn(inputBaseClasses, editableClasses)}
            placeholder="email@example.com"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label htmlFor="staff-phone" className="text-xs font-medium text-muted-foreground">
            Số điện thoại
          </Label>
          <Input
            id="staff-phone"
            type="tel"
            {...register("phone")}
            className={cn(inputBaseClasses, editableClasses)}
            placeholder="+84 xxx xxx xxx"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-2 mt-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            reset();
            setIsEditing(false);
          }}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? "Saving..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm ml-6 mt-1">{value || "—"}</p>
    </div>
  );
}
