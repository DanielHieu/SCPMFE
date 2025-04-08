"use client";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { EditCustomerForm } from "@/components/customers/EditCustomerForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import useDebounce from "@/hooks/useDebounce";
import { registerCustomer, searchCustomers, updateCustomer } from "@/lib/api";
import {
  Customer,
  RegisterCustomerPayload,
  UpdateCustomerPayload,
} from "@/types";
import { ListFilter, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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

  // NOTE: Fetch when debounced search term changes
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

  const counts = useMemo(
    () => ({
      all: allCustomer.length,
      active: allCustomer.filter((c) => c.isActive).length,
      inactive: allCustomer.filter((c) => !c.isActive).length,
    }),
    [allCustomer],
  );

  return (
    <div className="container mx-auto py-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Quản lý hệ thống</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Quản lý khách hàng</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Khách hàng
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <ListFilter className="w-4 h-4 mr-2" />
                Lọc: {
                  {
                    all: "Tất cả khách hàng",
                    active: "Đang hoạt động",
                    inactive: "Không hoạt động"
                  }[filterStatus]
                }{" "}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as FilterStatus)
                }
              >
                <DropdownMenuRadioItem value="all">
                  Tất cả khách hàng ({counts.all})
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
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9">
                <PlusCircle className="w-4 h-4 mr-2" />
                Thêm khách hàng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm khách hàng</DialogTitle>
              </DialogHeader>
              <CustomerForm
                onSubmitAction={handleAddCustomer}
                onCancelAction={() => setIsAddModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Table area */}
      <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-white">
        {isLoading && (
          <div className="p-6 text-center">Loading customer...</div>
        )}
        {error && (
          <div className="p-6 text-center text-red-500">Error: {error}</div>
        )}
        {!isLoading && !error && (
          <CustomerTable
            customers={filteredCustomers}
            isLoading={isLoading}
            error={error}
            onEditClick={handleEditClick}
            onRefresh={refreshData}
          />
        )}
      </div>

      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditingCustomer(null);
          setIsEditModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <EditCustomerForm
              onSubmitAction={handleUpdateCustomer}
              initialData={editingCustomer}
              onCancelAction={() => {
                setIsEditModalOpen(false);
                setEditingCustomer(null);
              }}
              key={`edit-${editingCustomer.customerId}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
