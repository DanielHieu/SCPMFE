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
        "bg-white border-b border-gray-200 z-10 transition-all duration-200 sticky top-0",
        "p-4 flex justify-between items-center h-16 flex-shrink-0"
      )}>
        <div className="w-full flex justify-center">
          <div className="animate-pulse w-48 h-6 bg-gray-200 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn(
      "bg-white z-10 transition-all duration-200 sticky top-0",
      isScrolled
        ? "shadow-md border-transparent"
        : "border-b border-gray-200",
      "p-4 flex justify-between items-center h-16 flex-shrink-0"
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
      <div className="flex items-center gap-2">
        {session?.user ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 hidden md:flex"
            >
              <Settings className="h-5 w-5" />
            </Button>

            <div className="h-6 border-l border-gray-200 mx-1 hidden md:block"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden">
                  <Avatar className="h-9 w-9 border-2 border-white">
                    <AvatarImage
                      src={session.user.image ?? undefined}
                      alt={session.user.name ?? "Người dùng"}
                    />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {session.user.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name ?? "Người dùng"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email ?? ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-500 focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button variant="outline" asChild className="font-medium">
            <Link href="/auth/login">Đăng nhập</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
