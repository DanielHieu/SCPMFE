"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { dashboardTheme } from "@/app/(dashboard)/theme";

const AuthorizedLayoutContent = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    // Close sidebar when route changes (for mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Detect scroll for header styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebarAction={toggleSidebar} />

            {/* Mobile overlay when sidebar is open */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={toggleSidebar}
                        aria-hidden="true"
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Main content area */}
            <div className="flex-1 flex flex-col w-full">
                {/* Header */}
                <Header
                    toggleSidebarAction={toggleSidebar}
                    isScrolled={isScrolled}
                />
                <main className={cn(
                    "flex-1 transition-all duration-200 ease-in-out",
                    "overflow-x-hidden overflow-y-auto",
                    dashboardTheme.content.background,
                    dashboardTheme.content.padding
                )}>
                    <div className={cn(
                        "mx-auto",
                        `max-w-[${dashboardTheme.layout.maxWidth}]`
                    )}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AuthorizedLayoutContent;