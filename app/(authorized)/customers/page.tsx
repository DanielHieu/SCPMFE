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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useDebounce from "@/hooks/useDebounce";
import { registerCustomer, searchCustomers, updateCustomer } from "@/lib/api";
import {
  Customer,
  RegisterCustomerPayload,
  UpdateCustomerPayload,
} from "@/types";
import { ListFilter, PlusCircle, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { fetchApi } from "../../../lib/api/api-helper";

type FilterStatus = "all" | "active" | "inactive";
type EditCustomerFormData = Omit<UpdateCustomerPayload, "customerId">;

export default function CustomerPage() {
  const [allCustomer, setALlCustomer] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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

  const handleAddCustomer = async (
    formData: Omit<RegisterCustomerPayload, "ownerId">,
  ) => {
    const ownerId = 1;
    try {
      await registerCustomer({ ...formData, ownerId: ownerId });
      setIsAddModalOpen(false);
      refreshData();
      toast.success("Thêm khách hàng thành công");
    } catch (error) {
      console.error("Failed to add customer:", error);
      toast.error(
        `Lỗi khi thêm khách hàng: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
      );
    }
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (formData: EditCustomerFormData) => {
    if (!editingCustomer) return;

    const payload: UpdateCustomerPayload = {
      ...formData,
      customerId: editingCustomer.customerId,
    };
    console.log("Submitting update:", payload);
    try {
      await updateCustomer(payload);
      toast.success("Cập nhật khách hàng thành công.");

      setIsEditModalOpen(false);
      setEditingCustomer(null);
      refreshData();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(
        `Lỗi khi cập nhật khách hàng: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
      );
    }
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Khách hàng
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 w-full md:w-auto">
                <ListFilter className="w-4 h-4 mr-2" />
                Lọc: {
                  {
                    all: "Tất cả khách hàng",
                    active: "Đang hoạt động",
                    inactive: "Không hoạt động"
                  }[filterStatus]
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as FilterStatus)
                }
              >
                <DropdownMenuRadioItem value="all">
                  Tất cả ({counts.all})
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">
                  Đang hoạt động ({counts.active})
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="inactive">
                  Không hoạt động ({counts.inactive})
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* Table area */}
      <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
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
