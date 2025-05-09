"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DateInputProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
}

export function DateInput({
  id,
  value = "",
  onChange,
  label,
  placeholder = "dd/MM/yyyy",
  className,
  error,
  min,
  max,
  disabled,
  required,
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [inputType, setInputType] = useState<"text" | "date">("text");

  // Convert between dd/MM/yyyy display format and yyyy-MM-dd ISO format
  const formatToDisplay = (isoDate: string): string => {
    if (!isoDate) return "";
    
    try {
      // If already in dd/MM/yyyy format, return as is
      if (isoDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return isoDate;
      }
      
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  const formatToISO = (displayDate: string): string => {
    if (!displayDate) return "";
    
    try {
      // If already in ISO format, return as is
      if (displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return displayDate;
      }
      
      // Parse dd/MM/yyyy format
      const parts = displayDate.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        if (day && month && year && day <= 31 && month <= 12 && year > 1900) {
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      }
      
      return displayDate;
    } catch {
      return displayDate;
    }
  };

  // Update display value when value prop changes
  useEffect(() => {
    setDisplayValue(formatToDisplay(value));
  }, [value]);

  const handleFocus = () => {
    setInputType("date");
  };

  const handleBlur = () => {
    setInputType("text");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (inputType === "date") {
      // When using date input, value is in ISO format
      onChange(newValue);
      setDisplayValue(formatToDisplay(newValue));
    } else {
      // When using text input, handle dd/MM/yyyy format
      setDisplayValue(newValue);
      
      // Only convert and call onChange if it's a valid date format
      const isoValue = formatToISO(newValue);
      if (isoValue !== newValue || newValue === "") {
        onChange(isoValue);
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Input
        id={id}
        type={inputType}
        value={inputType === "date" ? formatToISO(displayValue) : displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={inputType === "text" ? placeholder : undefined}
        className={cn("w-full", error && "border-red-500", className)}
        min={min}
        max={max}
        disabled={disabled}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
} 