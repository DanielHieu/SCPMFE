import * as React from "react"

import { cn } from "@/lib/utils"
import { cardStyles } from "@/lib/design-system"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean;
  }
>(({ className, hover = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      cardStyles.default.background,
      cardStyles.default.border,
      cardStyles.default.shadow,
      cardStyles.default.rounded,
      hover && cardStyles.default.hover,
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    withBackground?: boolean;
  }
>(({ className, withBackground = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 flex flex-col space-y-1.5",
      withBackground && cardStyles.header.background,
      withBackground && cardStyles.header.border,
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      cardStyles.title.size,
      cardStyles.title.weight,
      cardStyles.title.color,
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center px-6 py-4 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
))
CardAction.displayName = "CardAction"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
