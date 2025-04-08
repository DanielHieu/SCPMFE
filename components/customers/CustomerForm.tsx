"use client";

import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

const customerFormSchema = z.object({
  firstName: z.string().min(1, { message: "Tên không được để trống." }),
  lastName: z.string().min(1, { message: "Họ không được để trống." }),
  phone: z.string().min(10, { message: "Số điện thoại quá ngắn." }),
  email: z.string().email({ message: "Email không hợp lệ." }),
  username: z
    .string()
    .min(1, { message: "Tên đăng nhập không được để trống." })
    .max(50, "Tên đăng nhập quá dài"),
  password: z
    .string()
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." })
    .max(100),
  isActive: z.boolean().default(true),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  onSubmitAction: SubmitHandler<CustomerFormData>;
  initialData?: Partial<CustomerFormData>;
  isSubmitting?: boolean;
  className?: string;
  onCancelAction: () => void;
}

export function CustomerForm({
  onSubmitAction,
  initialData,
  isSubmitting = false,
  onCancelAction,
  className,
}: CustomerFormProps) {
  const isEditMode = !!initialData;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: initialData || { isActive: true },
  });

  // Helper function for rendering form fields with consistent styling
  const FormField = ({ 
    name, 
    label, 
    type = "text", 
    placeholder, 
    required = true 
  }: { 
    name: keyof CustomerFormData, 
    label: string, 
    type?: string, 
    placeholder: string,
    required?: boolean 
  }) => (
    <div className="space-y-2">
      <Label 
        htmlFor={name} 
        className="text-sm font-medium flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Input
        id={name}
        type={type}
        {...register(name as any)}
        placeholder={placeholder}
        className={cn(
          "transition-all duration-200 shadow-sm",
          "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
          errors[name] && "border-red-300 focus:border-red-500 focus:ring-red-200"
        )}
        aria-invalid={!!errors[name]}
      />
      
      {errors[name] && (
        <div className="flex items-center text-red-600 text-sm mt-1">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{errors[name]?.message as string}</span>
        </div>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmitAction)}
      className={cn(
        "space-y-6",
        className
      )}
    >
      <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Thông tin cá nhân</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField 
            name="firstName" 
            label="Tên" 
            placeholder="Việt" 
          />
          
          <FormField 
            name="lastName" 
            label="Họ" 
            placeholder="Nguyễn" 
          />
          
          <FormField 
            name="email" 
            label="Email" 
            type="email"
            placeholder="nguyen.viet@example.com" 
          />
          
          <FormField 
            name="phone" 
            label="Số điện thoại" 
            type="tel"
            placeholder="0123456789" 
          />
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Thông tin đăng nhập</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField 
            name="username" 
            label="Tên đăng nhập" 
            placeholder="Nhập tên đăng nhập" 
          />
          
          {!initialData && (
            <FormField 
              name="password" 
              label="Mật khẩu" 
              type="password"
              placeholder="••••••••" 
            />
          )}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border flex items-center justify-between">
          <div>
            <Label htmlFor="isActive" className="text-base font-medium text-gray-800">
              Trạng thái tài khoản
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              {control._formValues.isActive 
                ? "Tài khoản đang hoạt động và có thể đăng nhập" 
                : "Tài khoản đã bị vô hiệu hóa, không thể đăng nhập"
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${!control._formValues.isActive ? 'font-medium text-gray-500' : 'text-gray-400'}`}>
              Vô hiệu
            </span>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-green-500"
                />
              )}
            />
            <span className={`text-sm ${control._formValues.isActive ? 'font-medium text-green-600' : 'text-gray-400'}`}>
              Hoạt động
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancelAction}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting 
            ? "Đang xử lý..." 
            : isEditMode 
              ? "Cập nhật tài khoản" 
              : "Tạo tài khoản"
          }
        </Button>
      </div>
    </form>
  );
}
