"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getStaffById } from "@/lib/api";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api/api-helper";

// Import Types
import { Staff } from "@/types";
import { Task } from "@/types/taskEach";

// Import UI Components
import {
  Breadcrumb,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  UserCircle,
  MapPin,
  CalendarDays,
  User,
  Clock,
  Calendar,
  Check,
  AlertCircle,
  Clock3
} from "lucide-react";

export default function StaffDetailPage() {
  // Hooks
  const params = useParams();
  const staffId = parseInt(params.staffId as string, 10);

  // State
  const [staffData, setStaffData] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffTasks, setStaffTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

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

  // Lấy danh sách công việc của nhân viên
  const fetchStaffTasks = useCallback(async () => {
    if (!staffId) return;

    setIsTasksLoading(true);
    setTasksError(null);

    try {
      const response = await fetchApi(`/Staff/${staffId}/Tasks`, {
        method: "GET"
      });

      if (Array.isArray(response)) {
        setStaffTasks(response);
        console.log("Công việc của nhân viên:", response);
      } else {
        setTasksError("Định dạng dữ liệu nhận được không hợp lệ");
        setStaffTasks([]);
      }
    } catch (err) {
      console.error("Không thể lấy công việc của nhân viên:", err);
      setTasksError(err instanceof Error ? err.message : "Không thể tải công việc của nhân viên");
    } finally {
      setIsTasksLoading(false);
    }
  }, [staffId]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
    fetchStaffTasks();
  }, [fetchData, fetchStaffTasks]);

  const getInitials = (firstName?: string, lastName?: string): string =>
    `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "??";

  // Get status badge for task
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <Clock3 className="h-3 w-3" /> Chờ xử lý
        </Badge>;
      case 'InProgress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Đang thực hiện
        </Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <Check className="h-3 w-3" /> Hoàn thành
        </Badge>;
      default:
        return null;
    }
  };

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
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/dashboard" },
            { label: "Quản lý nhân viên", href: "/staffs" },
            { label: "Chi tiết nhân viên" }
          ]}
        />

        {/* Staff Header with Profile */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 h-32 relative">
            <div className="absolute -bottom-16 left-8">
              <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl">
                  {getInitials(staffData.firstName, staffData.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="mt-20 px-8 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {staffData.firstName} {staffData.lastName}
                  </h1>
                  <Badge
                    variant={staffData.isActive ? "default" : "outline"}
                    className={staffData.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}
                  >
                    {staffData.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
                <p className="text-gray-500 mt-1">Nhân viên ID: #{staffData.staffId}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{staffData.email || "Chưa cập nhật"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-green-50 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{staffData.phone || "Chưa cập nhật"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-purple-50 p-2 rounded-full">
                  <UserCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tài khoản</p>
                  <p className="font-medium">@{staffData.username || "chưa đặt"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Schedule Work Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 py-2.5 text-center">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Lịch làm việc
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isTasksLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-green-500 rounded-full border-t-transparent"></div>
                </div>
              ) : tasksError ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400 opacity-60" />
                  <p>Không thể tải lịch làm việc: {tasksError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchStaffTasks}
                    className="mt-4"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : staffTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Không có lịch làm việc</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {staffTasks.map((task) => (
                    <div key={task.taskEachId} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                        </div>
                        <div>
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{task.startDate} - {task.endDate}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`
                            ${task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                              task.priority === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'}
                          `}
                        >
                          {task.priority === 'High' ? 'Cao' :
                            task.priority === 'Medium' ? 'Trung bình' : 'Thấp'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
