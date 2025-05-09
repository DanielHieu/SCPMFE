"use client";

import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  ParkingSquare,
  Users,
  Wifi,
  X,
  ChevronRight,
  Contact
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { dashboardTheme } from "@/app/(dashboard)/theme";
import { colors } from "@/lib/design-system";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: { href: string; label: string }[];
}

const sidebarItems: NavItem[] = [
  { label: "Bảng điều khiển", href: "/dashboard", icon: LayoutDashboard,
    subItems: [
      { label: "Doanh thu hợp đồng", href: "/dashboard/contract" },
      { label: "Doanh thu vãng lai", href: "/dashboard/walkin" },
    ]
  },
  {
    label: "Người dùng",
    href: "/users",
    icon: Users,
    subItems: [
      { label: "Nhân viên", href: "/staffs" },
      { label: "Khách hàng", href: "/customers" },
    ]
  },
  { label: "Hợp đồng", href: "/contracts", icon: FileText },
  { label: "Bãi đậu xe", href: "/parkinglots", icon: ParkingSquare },
  { label: "Nhiệm vụ", href: "/tasks", icon: ClipboardList },
  { label: "Quản lý cảm biến", href: "/sensors", icon: Wifi },
  { label: "Đánh giá", href:"/feedbacks", icon: Contact }
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebarAction: () => void;
}

export default function Sidebar({ isOpen, toggleSidebarAction }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Helper to determine if a nav item is active
  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === "/" && pathname === "/") return true;
    // For other routes, check if pathname starts with the href (for nested routes)
    return href !== "/" && pathname.startsWith(href);
  };

  // Helper to determine if a sub-item should be shown
  const shouldExpandItem = (item: NavItem) => {
    return expandedItem === item.href || (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href)));
  };

  // Toggle the expanded state of an item with subitems
  const toggleExpand = (href: string) => {
    setExpandedItem(expandedItem === href ? null : href);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex-shrink-0 min-h-screen",
        dashboardTheme.sidebar.background,
        `border-r ${dashboardTheme.sidebar.borderColor}`,
        dashboardTheme.sidebar.boxShadow,
        "flex flex-col transition-transform duration-300 ease-in-out md:sticky md:translate-x-0",
        `w-[${dashboardTheme.sidebar.width}]`,
        isOpen ? "translate-x-0" : "-translate-x-full", // Slide in/out on mobile
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand Area */}
        <div className={cn(
          "h-16 flex items-center justify-between px-4",
          `border-b ${dashboardTheme.sidebar.borderColor}`
        )}>
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white">
              SCPM
            </div>
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Dashboard
            </span>
          </Link>
          <button
            onClick={toggleSidebarAction}
            className="md:hidden p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {sidebarItems.map((item) => {
              const isNavActive = isActive(item.href);
              const expanded = shouldExpandItem(item);

              return (
                <div key={item.href} className="mb-1">
                  {/* Main navigation item */}
                  {item.subItems ? (
                    // Item with sub-items
                    <button
                      onClick={() => toggleExpand(item.href)}
                      className={cn(
                        "flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isNavActive
                          ? dashboardTheme.sidebar.activeLink
                          : `${dashboardTheme.sidebar.textColor} ${dashboardTheme.sidebar.hoverLink}`
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 mr-3", isNavActive && "text-primary")} />
                      <span>{item.label}</span>
                      <ChevronRight
                        className={cn(
                          "ml-auto h-4 w-4 transition-transform",
                          expanded && "transform rotate-90"
                        )}
                      />
                    </button>
                  ) : (
                    // Regular item
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isNavActive
                          ? dashboardTheme.sidebar.activeLink
                          : `${dashboardTheme.sidebar.textColor} ${dashboardTheme.sidebar.hoverLink}`
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 mr-3", isNavActive && "text-primary")} />
                      <span>{item.label}</span>
                    </Link>
                  )}

                  {/* Sub-items if expanded */}
                  {item.subItems && expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-10 mt-1 space-y-1"
                    >
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname.startsWith(subItem.href);
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                              isSubActive
                                ? dashboardTheme.sidebar.activeLink
                                : `text-gray-600 ${dashboardTheme.sidebar.hoverLink}`
                            )}
                          >
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full mr-3",
                              isSubActive ? "bg-primary" : "bg-gray-400"
                            )}></div>
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer section with version info or additional links */}
        <div className={cn(
          "p-4 text-xs text-gray-500",
          `border-t ${dashboardTheme.sidebar.borderColor}`
        )}>
          <div className="flex items-center justify-between">
            <span>SCPM Dashboard</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
