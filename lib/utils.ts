import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  try {
    return format(new Date(date), "dd/MM/yyyy");
  }
  catch (error) {
    console.error(error);
    return "Không có thông tin";
  }
}

export function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
  catch (error) {
    console.error(error);
    return "Không có thông tin";
  }
}
