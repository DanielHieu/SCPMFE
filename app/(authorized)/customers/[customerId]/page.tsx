"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getCustomerById,
  getCustomerVehicles,
  getCustomerFeedback,
  getContractsOfCustomer,
} from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import Image from "next/image";

// Import Types
import {
  Customer,
  Car,
  Contract,
  Feedback,
} from "@/types";

// Import sub-components
import { CustomerContractsTable } from "@/components/customers/CustomerContractsTable";
import { CustomerFeedbackList } from "@/components/customers/CustomerFeedbackList";

// Import UI Components
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Info, RefreshCw, ArrowLeft, Car as CarIcon, FileText, MessageSquare, Calendar, User, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
//import { Separator } from "@/components/ui/separator";

export default function CustomerDetailPage() {
  // Hooks
  const params = useParams();
  const router = useRouter();
  const customerId = parseInt(params.customerId as string, 10);

  // State for fetched data
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [contractsData, setContractsData] = useState<Contract[]>([]);
  const [vehiclesData, setVehiclesData] = useState<Car[]>([]);
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (isNaN(customerId)) {
        setError("Invalid Customer ID");
        setIsLoading(false);
        return;
      }

      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const results = await Promise.allSettled([
          getCustomerById(customerId),
          getCustomerVehicles(customerId),
          getCustomerFeedback(customerId),
          getContractsOfCustomer(customerId),
        ]);

        const customerResult = results[0];
        const vehiclesResult = results[1];
        const feedbackResult = results[2];
        const contractsResult = results[3];

        if (customerResult.status === "rejected" || !customerResult.value) {
          console.error(
            "Failed to fetch core customer data:",
            customerResult.status === "rejected"
              ? customerResult.reason
              : "No data returned",
          );
          setError("Error loading essential customer data.");
          setCustomerData(null); // Clear potentially stale data
        } else {
          setCustomerData(customerResult.value);
        }

        if (vehiclesResult.status === "fulfilled") {
          setVehiclesData(vehiclesResult.value || []);
        } else {
          console.error("Failed vehicle fetch:", vehiclesResult.reason);
        }

        if (feedbackResult.status === "fulfilled") {
          setFeedbackData(feedbackResult.value || []);
        } else {
          console.error("Failed feedback fetch:", feedbackResult.reason);
        }

        if (contractsResult.status === "fulfilled") {
          setContractsData(contractsResult.value || []);
        } else {
          console.error("Failed contracts fetch:", contractsResult.reason);
        }

        if (!showLoading) {
          toast.success("Dữ liệu đã được cập nhật");
        }
      } catch (err) {
        console.error("Failed overall fetch:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load customer details",
        );

        if (!showLoading) {
          toast.error("Không thể cập nhật dữ liệu");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [customerId],
  );

  // Fetch data on initial component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="space-y-6">
          <div className="flex items-center">
            <Skeleton className="h-8 w-64" />
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-0.5 w-full mt-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-0">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-0">
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-md" />
                    <Skeleton className="h-20 w-full rounded-md" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-0">
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-64 w-full rounded-md" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <Info className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-3">Đã xảy ra lỗi</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push('/customers')}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
            <Button
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              onClick={() => fetchData()}
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6">
            <Info className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-amber-800 mb-3">Không tìm thấy dữ liệu</h3>
          <p className="text-amber-600 mb-6">Không thể tải thông tin khách hàng hoặc khách hàng không tồn tại.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push('/customers')}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
            <Button
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
              onClick={() => fetchData()}
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Breadcrumb
            items={[
              {
                label: "Trang chủ",
                href: "/dashboard",
              },
              {
                label: "Quản lý khách hàng",
                href: "/customers",
              },
              {
                label: "Chi tiết khách hàng",
              }
            ]}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push('/customers')}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => fetchData(false)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </div>

        {/* Customer Profile Header */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card className="border-none shadow-md overflow-hidden">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {customerData.firstName?.charAt(0)}{customerData.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="mt-4 text-xl font-bold text-center">
                  {customerData.firstName} {customerData.lastName}
                </h1>
                <Badge
                  variant={customerData.isActive ? "secondary" : "destructive"}
                  className={`mt-2 rounded-full px-3 py-1 ${customerData.isActive ? 'bg-emerald-100 text-emerald-800' : ''}`}
                >
                  {customerData.isActive ? "Đang hoạt động" : "Không hoạt động"}
                </Badge>
                <div className="w-full mt-6 space-y-3">
                  {customerData.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary/70 flex-shrink-0" />
                      <span className="truncate">{customerData.email}</span>
                    </div>
                  )}
                  {customerData.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-primary/70 flex-shrink-0" />
                      <span>{customerData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Thông tin khách hàng</h3>
          
                    <dl className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">ID khách hàng:</dt>
                        <dd className="font-medium">{customerData.customerId}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Thống kê</h3>
            
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-blue-600 font-medium">Phương tiện</p>
                        <p className="text-2xl font-bold text-blue-700">{vehiclesData.length}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-amber-600 font-medium">Hợp đồng</p>
                        <p className="text-2xl font-bold text-amber-700">{contractsData.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3">
            <Tabs defaultValue="overview" className="w-full">
              <Card className="border-none shadow-md">
                <CardHeader className="px-6 py-4 border-b">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="overview" className="flex items-center gap-2 text-xs md:text-sm">
                      <Info className="h-4 w-4" />
                      <span className="hidden md:inline">Tổng quan</span>
                      <span className="md:hidden">Tổng quan</span>
                    </TabsTrigger>
                    <TabsTrigger value="contracts" className="flex items-center gap-2 text-xs md:text-sm">
                      <FileText className="h-4 w-4" />
                      <span className="hidden md:inline">Hợp đồng</span>
                      <span className="md:hidden">Hợp đồng</span>
                    </TabsTrigger>
                    <TabsTrigger value="vehicles" className="flex items-center gap-2 text-xs md:text-sm">
                      <CarIcon className="h-4 w-4" />
                      <span className="hidden md:inline">Phương tiện</span>
                      <span className="md:hidden">Phương tiện</span>
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="flex items-center gap-2 text-xs md:text-sm">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden md:inline">Phản hồi</span>
                      <span className="md:hidden">Phản hồi</span>
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="p-6">
                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-6">
                      {/* Recent Contracts */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary/70" />
                            Hợp đồng gần đây
                          </h3>
                        </div>
                        {contractsData.length > 0 ? (
                          <div className="rounded-lg border overflow-hidden">
                            <CustomerContractsTable contracts={contractsData.slice(0, 3)} />
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Khách hàng chưa có hợp đồng nào</p>
                          </div>
                        )}
                      </div>

                      {/* Vehicles */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CarIcon className="h-5 w-5 text-primary/70" />
                            Phương tiện
                          </h3>
                        </div>
                        {vehiclesData.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vehiclesData.slice(0, 2).map((vehicle) => (
                              <Card key={vehicle.carId} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                                <div className="relative h-36 w-full bg-gray-100">
                                  {vehicle.thumbnail ? (
                                    <Image
                                      src={vehicle.thumbnail}
                                      alt={`${vehicle.brand} ${vehicle.model}`}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                      <CarIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <CardContent className="p-4">
                                  <h4 className="font-medium text-primary">{vehicle.brand} {vehicle.model}</h4>
                                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <p className="text-xs text-gray-500">Biển số</p>
                                      <p className="font-medium">{vehicle.licensePlate}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Màu sắc</p>
                                      <p className="font-medium">{vehicle.color}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                            <CarIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Khách hàng chưa có phương tiện nào</p>
                          </div>
                        )}
                      </div>

                      {/* Recent Feedback */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary/70" />
                            Phản hồi gần đây
                          </h3>
                        </div>
                        <CustomerFeedbackList feedback={feedbackData.slice(0, 2)} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contracts" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Danh sách hợp đồng</h3>
                      </div>
                      {contractsData.length > 0 ? (
                        <div className="rounded-lg border overflow-hidden">
                          <CustomerContractsTable contracts={contractsData} />
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có hợp đồng nào</h3>
                          <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Khách hàng này chưa có hợp đồng nào trong hệ thống.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="vehicles" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Danh sách phương tiện</h3>
                      </div>
                      {vehiclesData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {vehiclesData.map((vehicle) => (
                            <Card key={vehicle.carId} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                              <div className="relative h-48 w-full bg-gray-100">
                                {vehicle.thumbnail ? (
                                  <Image
                                    src={vehicle.thumbnail}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                    <CarIcon className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <h4 className="font-medium text-lg text-primary">{vehicle.brand} {vehicle.model}</h4>
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Biển số</p>
                                    <p className="font-medium">{vehicle.licensePlate}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Màu sắc</p>
                                    <p className="font-medium">{vehicle.color}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Trạng thái</p>
                                    <Badge variant="outline" className="mt-1">
                                      {vehicle.status || "Đang hoạt động"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <Button variant="outline" size="sm">Xem chi tiết</Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
                          <CarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có phương tiện nào</h3>
                          <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Khách hàng này chưa đăng ký phương tiện nào trong hệ thống.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="feedback" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Lịch sử phản hồi</h3>
                      {feedbackData.length > 0 ? (
                        <CustomerFeedbackList feedback={feedbackData} />
                      ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
                          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có phản hồi nào</h3>
                          <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Khách hàng này chưa gửi phản hồi nào trong hệ thống.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
