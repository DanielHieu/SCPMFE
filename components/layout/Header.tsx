"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Bell, LogOut, Menu, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { dashboardTheme } from "@/app/(dashboard)/theme";

interface HeaderProps {
  toggleSidebarAction: () => void;
  isScrolled?: boolean;
}

export default function Header({ toggleSidebarAction, isScrolled = false }: HeaderProps) {
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  // Loading state
  if (status === "loading") {
    return (
      <header className={cn(
        dashboardTheme.header.background,
        dashboardTheme.header.borderColor,
        "z-10 transition-all duration-200 sticky top-0",
        `h-[${dashboardTheme.header.height}]`,
        "p-4 flex justify-between items-center flex-shrink-0"
      )}>
        <div className="w-full flex justify-center">
          <div className="animate-pulse w-48 h-6 bg-gray-200 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn(
      dashboardTheme.header.background,
      "z-10 transition-all duration-200 sticky top-0",
      isScrolled
        ? "shadow-md border-transparent"
        : `border-b ${dashboardTheme.header.borderColor}`,
      `h-[${dashboardTheme.header.height}]`,
      "p-4 flex justify-between items-center flex-shrink-0"
    )}>
      {/* Left side - Menu button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarAction}
          className="md:hidden text-gray-500 hover:text-gray-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right side - Notifications, settings, user menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User avatar"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-normal">
                <div className="font-medium">{session?.user?.name}</div>
                <div className="text-xs text-gray-500">{session?.user?.email}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
