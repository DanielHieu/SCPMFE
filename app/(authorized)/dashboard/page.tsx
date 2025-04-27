"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import GeneralTabContent from "@/components/dashboard/GeneralTabContent";
import RevenueTabContent from "@/components/dashboard/RevenueTabContent";
import { Clock } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading completion or handle actual initial setup if needed
        // Data fetching is now handled within TabContent components
        const timer = setTimeout(() => setIsLoading(false), 500); // Example: remove loader after 500ms
        return () => clearTimeout(timer); // Cleanup timer
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Bảng thống kê</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.refresh()}>
                        <Clock className="mr-2 h-4 w-4" />
                        Làm mới
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <GeneralTabContent />
                </TabsContent>

                <TabsContent value="revenue" className="space-y-6">
                    <RevenueTabContent />
                </TabsContent>
            </Tabs>
        </div>
    );
}
