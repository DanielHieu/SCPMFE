"use client";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useDebounce from "@/hooks/useDebounce";
import { searchCustomers} from "@/lib/api";
import { fetchApi } from "@/lib/api/api-helper";
import {
  Customer,
} from "@/types";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterStatus = "all" | "active" | "inactive";

export default function CustomerPage() {
  const [allCustomer, setALlCustomer] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [disableReason, setDisableReason] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchCustomers = useCallback(async (term: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchCustomers({ keyword: term ?? "" });
      console.log(
        ">>> Raw data received in fetchCustomers:",
        JSON.stringify(data, null, 2),
      );
      setALlCustomer(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
      setALlCustomer([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when debounced search term changes
  useEffect(() => {
    fetchCustomers(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    if (filterStatus === "active") {
      return allCustomer.filter((c) => c.isActive);
    }
    if (filterStatus === "inactive") {
      return allCustomer.filter((c) => !c.isActive);
    }     
    return allCustomer;
  }, [allCustomer, filterStatus]);

  const refreshData = useCallback(() => {
    fetchCustomers(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchCustomers]);

  const handleApproveClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsApproveDialogOpen(true);
  };

  const handleDisableClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDisableReason("");
    setIsDisableDialogOpen(true);
  };

  const handleApproveCustomer = async () => {
    if (!selectedCustomer) return;

    setIsLoading(true);
    try {
      // Call the external API to approve the customer
      await fetchApi(`/Customer/Approve?customerId=${selectedCustomer.customerId}`, {
        method: 'POST',
      });

      toast.success("Khách hàng đã được phê duyệt thành công");
      setIsApproveDialogOpen(false);
      refreshData();
    } catch (error) {
      console.error("Approve failed:", error);
      toast.error(
        `Lỗi khi phê duyệt khách hàng: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableCustomer = async () => {
    if (!selectedCustomer || !disableReason.trim()) return;

    setIsLoading(true);
    try {
      // Call the external API to disable the customer
      await fetchApi(`/Customer/Disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer.customerId,
          reason: disableReason
        }),
      });

      toast.success("Khách hàng đã bị vô hiệu hóa thành công");
      setIsDisableDialogOpen(false);
      refreshData();
    } catch (error) {
      console.error("Disable failed:", error);
      toast.error(
        `Lỗi khi vô hiệu hóa khách hàng: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const counts = useMemo(
    () => ({
      all: allCustomer.length,
      active: allCustomer.filter((c) => c.isActive).length,
      inactive: allCustomer.filter((c) => !c.isActive).length,
    }),
    [allCustomer],
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Quản lý khách hàng" }
        ]}
      />

      {/* Unified container with white background */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Header section */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý khách hàng
          </h1>
        </div>

        {/* Search section */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-200">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 pr-4 w-full"
            />
          </div>
        </div>

        {/* Gmail-style tabs - directly above the table with no gap */}
        <div className="border-b border-gray-200">
          <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)} className="w-full">
            <TabsList className="h-12 bg-transparent p-0 flex w-full justify-start rounded-none border-0">
              <TabsTrigger 
                value="all" 
                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
              >
                Tất cả ({counts.all})
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
              >
                Đang hoạt động ({counts.active})
              </TabsTrigger>
              <TabsTrigger 
                value="inactive" 
                className="rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-gray-600 data-[state=active]:text-blue-600 px-6"
              >
                Không hoạt động ({counts.inactive})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table area - no padding to connect directly with tabs */}
        <div className="pb-0">
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-gray-500">Đang tải dữ liệu khách hàng...</p>
            </div>
          )}
          {error && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                <span className="text-red-500 text-xl">!</span>
              </div>
              <p className="text-red-500">Lỗi: {error}</p>
            </div>
          )}
          {!isLoading && !error && (
            <CustomerTable
              customers={filteredCustomers}
              isLoading={isLoading}
              error={error}
              onRefresh={refreshData}
              onApproveClick={handleApproveClick}
              onDisableClick={handleDisableClick}
            />
          )}
        </div>
      </div>

      {/* Approve customer confirmation dialog */}
      <Dialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận phê duyệt khách hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn phê duyệt khách hàng {selectedCustomer?.firstName} {selectedCustomer?.lastName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleApproveCustomer}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable customer dialog */}
      <Dialog
        open={isDisableDialogOpen}
        onOpenChange={setIsDisableDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vô hiệu hóa khách hàng</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do vô hiệu hóa khách hàng {selectedCustomer?.firstName} {selectedCustomer?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Nhập lý do vô hiệu hóa..."
            value={disableReason}
            onChange={(e) => setDisableReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisableDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableCustomer}
              disabled={!disableReason.trim()}
            >
              Vô hiệu hóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
