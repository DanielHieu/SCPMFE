// components/features/customers/EditableCustomerInfoCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Customer, UpdateCustomerPayload } from "@/types"; // Import types based on your API
import { updateCustomer } from "@/lib/api"; // Import API function

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Loader2, MoreVertical, ToggleLeft, ToggleRight } from "lucide-react";

// Define validation schema based on UpdateCustomerRequest [cite: uploaded:API-docsc.txt, 267-270]
// Allow null for potentially optional fields if API accepts null, otherwise use optional()
// Check if your API treats empty strings differently from null
const updateCustomerSchema = z.object({
  firstName: z.string().min(1, "First name required").nullable(),
  lastName: z.string().min(1, "Last name required").nullable(),
  phone: z.string().min(10, "Invalid phone number").nullable(),
  email: z.string().email("Invalid email").nullable(),
  // isActive: z.boolean(),
});

// Infer the type for form data from the schema
type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;

interface EditableCustomerInfoCardProps {
  initialData: Customer; // Receive initial data from server component page props
}

export function EditableCustomerInfoCard({
  initialData,
}: EditableCustomerInfoCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    initialData.isActive ?? false,
  );

  const {
    register,
    handleSubmit,
    // control, // Needed for Switch
    formState: { errors, isDirty }, // isDirty checks if form values have changed
    reset, // Function to reset form state after successful update
  } = useForm<UpdateCustomerFormData>({
    resolver: zodResolver(updateCustomerSchema),
    // Initialize form with data passed via props
    defaultValues: {
      firstName: initialData.firstName || null,
      lastName: initialData.lastName || null,
      phone: initialData.phone || null,
      email: initialData.email || null,
      // isActive: initialData.isActive ?? false, // Default to false if undefined/null
    },
  });

  // Update local status state if initialData prop changes (e.g., after parent refresh)
  useEffect(() => {
    setCurrentStatus(initialData.isActive ?? false);
    // Also reset the form if initialData changes from parent refresh
    reset({
      firstName: initialData.firstName || null,
      lastName: initialData.lastName || null,
      phone: initialData.phone || null,
      email: initialData.email || null,
    });
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<UpdateCustomerFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<UpdateCustomerPayload> = {
        customerId: initialData.customerId, // Include the customer ID from initial data
        // Pass the validated form data
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        isActive: currentStatus,
      };
      const updatedCustomerData = await updateCustomer(
        payload as UpdateCustomerPayload,
      ); // Call API client function

      // Reset the form's state and default values to the newly updated data
      // This marks the form as "not dirty" again and reflects changes
      reset(data);
    } catch (error) {
      console.error("Failed to update customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handler for changing the status via dropdown ---
  const handleStatusChange = async (newStatus: boolean) => {
    // Prevent changing to the same status
    if (newStatus === currentStatus) return;

    setIsSubmitting(true); // Use submitting state to disable dropdown/button maybe
    try {
      const payload: UpdateCustomerPayload = {
        customerId: initialData.customerId,
        email: initialData.email || "",
        firstName: initialData.firstName || "", // Send current value
        lastName: initialData.lastName || "", // Send current value
        phone: initialData.phone || "",
        isActive: newStatus, // Only send isActive flag
      };
      await updateCustomer(payload);
      /* toast({
        title: "Success",
        description: `Customer status set to ${newStatus ? "Active" : "Inactive"}.`,
      }); */
      toast.success(
        `Customer status set to ${newStatus ? "Active" : "Inactive"}.`,
      );
      setCurrentStatus(newStatus); // Update local state immediately

      // Optional: Trigger parent refresh if function was passed
      // if (refreshData) refreshData();
    } catch (error) {
      console.error("Failed to update customer status:", error);
      /* toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update status: ${error instanceof Error ? error.message : "Unknown error"}`,
      }); */
      toast.error(
        `Failed to update status: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Base classes for the hover-to-edit effect ---
  const inputBaseClasses =
    "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 read-only:bg-transparent read-only:cursor-default disabled:cursor-not-allowed";
  const hoverClasses = "hover:bg-muted/50"; // Subtle background on hover
  const editPadding = "px-2 py-1 h-auto"; // Adjust padding to feel more like

  // Helper for avatar initials
  const getInitials = (first?: string | null, last?: string | null): string => {
    return (
      `${first?.charAt(0) ?? ""}${last?.charAt(0) ?? ""}`.toUpperCase() || "NA"
    );
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="px-6 py-4 space-y-0">
          <div className="flex items-center justify-between">
            {/* Avatar & Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                  {getInitials(initialData.firstName, initialData.lastName)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {initialData.firstName} {initialData.lastName}
                  </h2>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2 py-1 text-sm font-medium",
                      currentStatus
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700",
                    )}
                  >
                    {currentStatus ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
                {initialData.username && (
                  <p className="text-muted-foreground text-sm">
                    @{initialData.username}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-9 w-9 p-2 hover:bg-accent/50"
                >
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Tùy chọn</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={currentStatus}
                  onSelect={() => handleStatusChange(true)}
                  className="text-sm gap-2"
                >
                  <ToggleRight className="h-4 w-4" />
                  Kích hoạt
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!currentStatus}
                  onSelect={() => handleStatusChange(false)}
                  className="text-sm gap-2 text-red-600"
                >
                  <ToggleLeft className="h-4 w-4" />
                  Vô hiệu hóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-medium">
                  Họ
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className="focus-visible:ring-primary/50"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-medium">
                  Tên
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className="focus-visible:ring-primary/50"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email" className="font-medium">
                  Địa chỉ email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="focus-visible:ring-primary/50"
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone" className="font-medium">
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className="focus-visible:ring-primary/50"
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="username_display" className="font-medium">
                  Tên người dùng
                </Label>
                <Input
                  id="username_display"
                  value={initialData.username || "N/A"}
                  readOnly
                  className="text-muted-foreground/80 bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !isDirty}
                className="gap-2 px-6 font-medium"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
