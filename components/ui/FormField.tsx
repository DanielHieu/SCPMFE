import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/design-system';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperTextClassName?: string;
  fullWidth?: boolean;
  required?: boolean;
}

export function FormField({
  label,
  name,
  error,
  helperText,
  containerClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  helperTextClassName,
  fullWidth = true,
  required = false,
  className,
  ...props
}: FormFieldProps) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div 
      className={cn(
        'flex flex-col space-y-2',
        fullWidth && 'w-full',
        containerClassName
      )}
    >
      {label && (
        <Label 
          htmlFor={inputId} 
          className={cn(
            'text-sm font-medium text-gray-700',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <Input
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
          inputClassName
        )}
        {...props}
      />
      
      {error && (
        <p 
          id={errorId} 
          className={cn(
            'text-sm text-red-500',
            errorClassName
          )}
        >
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p 
          id={helperId} 
          className={cn(
            'text-xs text-gray-500',
            helperTextClassName
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
} 