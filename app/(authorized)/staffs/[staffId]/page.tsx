"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getStaffById, updateStaff } from "@/lib/api";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Import Types
import { Staff, UpdateStaffPayload } from "@/types";

// Import sub-components
import { EditableStaffInfoCard } from "@/components/staffs/EditableStaffInfoCard";

// Import UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarClock, 
  ClipboardList, 
  Mail, 
  Phone, 
  UserCircle, 
  Clock, 
  UsersRound,
  PlusCircle,
  Briefcase,
  CalendarDays
} from "lucide-react";

export default function StaffDetailPage() {
  // Hooks
  const params = useParams();
  const staffId = parseInt(params.staffId as string, 10);
  const ownerId = 1; // TODO: Get from auth context

  // State
  const [staffData, setStaffData] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (isNaN(staffId)) {
      setError("Invalid Staff ID");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getStaffById(staffId);
      if (!data) {
        setError("Staff not found");
        setStaffData(null);
      } else {
        setStaffData(data);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load staff details"
      );
    } finally {
      setIsLoading(false);
    }
  }, [staffId]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (newStatus: boolean) => {
    if (!staffData) return;
    
    try {
      const payload: UpdateStaffPayload = {
        staffAccountId: staffId,
        ownerId: ownerId,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        phone: staffData.phone,
        email: staffData.email,
        isActive: newStatus
      };
      
      await updateStaff(payload);
      toast.success(`Staff status changed to ${newStatus ? 'Active' : 'Inactive'}`);
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(`Failed to update status: ${error}`);
    }
  };

  const getInitials = (firstName?: string, lastName?: string): string =>
    `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "??";

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-48 w-full max-w-2xl bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 text-red-500 p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => fetchData()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!staffData) {
    return (
      <div className="container mx-auto py-6 text-center">
        Staff data could not be loaded.
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumb className="mb-2 px-1">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/staffs">Quản lý nhân viên</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chi tiết nhân viên</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Staff Header with Quick Info */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/5 text-primary text-xl">
                  {getInitials(staffData.firstName, staffData.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {staffData.firstName} {staffData.lastName}
                  </h1>
                  <Badge 
                    variant={staffData.isActive ? "default" : "outline"}
                    className={staffData.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {staffData.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                  {staffData.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <span>{staffData.email}</span>
                    </div>
                  )}
                  {staffData.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{staffData.phone}</span>
                    </div>
                  )}
                  {staffData.username && (
                    <div className="flex items-center">
                      <UserCircle className="h-4 w-4 mr-1" />
                      <span>@{staffData.username}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-2">
              <Button
                variant={staffData.isActive ? "destructive" : "default"}
                size="sm"
                onClick={() => handleStatusChange(!staffData.isActive)}
                className="whitespace-nowrap"
              >
                {staffData.isActive ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Đặt trạng thái không hoạt động
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Đặt trạng thái hoạt động
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                <UsersRound className="h-4 w-4 mr-2" />
                Gán nhiệm vụ
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Staff Info Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-lg font-medium">
                  Thông tin nhân viên
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <EditableStaffInfoCard 
                  initialData={staffData} 
                  ownerId={ownerId} 
                />
              </CardContent>
            </Card>
            
            {/* Scheduled Work Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">
                  Lịch làm việc
                </CardTitle>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Không có lịch làm việc</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Thêm lịch làm việc
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="tasks">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tasks">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Nhiệm vụ đã giao
                </TabsTrigger>
                <TabsTrigger value="history">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Lịch sử công việc
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tasks" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Không có nhiệm vụ nào được giao cho nhân viên này</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Gán nhiệm vụ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Không có lịch sử công việc</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
