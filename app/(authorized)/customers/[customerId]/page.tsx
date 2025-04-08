"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getCustomerById,
  getCustomerVehicles,
  getCustomerFeedback,
  addContract,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/lib/api";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Import Types
import {
  Customer,
  Car,
  Contract,
  Feedback,
  AddContractPayload,
  AddVehiclePayload,
  UpdateVehiclePayload,
} from "@/types";

// Import sub-components
import { EditableCustomerInfoCard } from "@/components/customers/EditableCustomerInfoCard";
import { CustomerContractsTable } from "@/components/customers/CustomerContractsTable";
import { CustomerVehiclesTable } from "@/components/customers/CustomerVehiclesTable";
import { CustomerFeedbackList } from "@/components/customers/CustomerFeedbackList";
import { AddContractForm } from "@/components/contracts/AddContractForm"; // Add Contract form

// Import UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { Button } from "@/components/ui/button";

export default function CustomerDetailPage() {
  // Hooks
  const params = useParams();
  const customerId = parseInt(params.customerId as string, 10);

  // State for fetched data
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [contractsData, setContractsData] = useState<Contract[]>([]);
  const [vehiclesData, setVehiclesData] = useState<Car[]>([]);
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Car | null>(null);

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (isNaN(customerId)) {
        setError("Invalid Customer ID");
        setIsLoading(false);
        return;
      }
      if (showLoading) setIsLoading(true);
      setError(null);
      console.log(`Fetching data for customer ID: ${customerId}`);
      try {
        const results = await Promise.allSettled([
          getCustomerById(customerId),
          getCustomerVehicles(customerId),
          getCustomerFeedback(customerId),
        ]);

        const customerResult = results[0];
        const vehiclesResult = results[1];
        const feedbackResult = results[2];

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
          // We'll handle contracts separately since they're not directly part of Customer type
          // Try to get contracts from API or leave as empty array
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
      } catch (err) {
        console.error("Failed overall fetch:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load customer details",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [customerId],
  );

  // Fetch data on initial component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddContractSubmit = async (payload: AddContractPayload) => {
    try {
      await addContract(payload);
      toast.success("Contract created. Status is Pending Payment.");

      setIsAddContractModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create contract:", error);
      toast.error(
        `Failed to create contract: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleAddVehicleSubmit = async (
    formData: Omit<AddVehiclePayload, "customerId">,
  ) => {
    const payload: AddVehiclePayload = { ...formData, customerId: customerId };
    try {
      await addVehicle(payload);
      toast.success("Vehicle added.");
      setIsAddVehicleModalOpen(false);
      fetchData(false); // Refresh data without full loading indicator
    } catch (error) {
      toast.error(`Failed: ${error}`);
    }
  };

  const handleEditVehicleClick = (vehicle: Car) => {
    setEditingVehicle(vehicle);
    setIsEditVehicleModalOpen(true);
  };

  // BUG: Updating with the same liensePlate is error
  const handleUpdateVehicleSubmit = async (
    formData: Omit<UpdateVehiclePayload, "customerId" | "carId">,
  ) => {
    if (!editingVehicle) return;
    const payload: UpdateVehiclePayload = {
      ...formData,
      carId: editingVehicle.carId,
      customerId: customerId,
    };
    try {
      await updateVehicle(payload);
      toast.success("Vehicle updated.");
      setIsEditVehicleModalOpen(false);
      setEditingVehicle(null);
      fetchData(false);
    } catch (error) {
      toast.error(`Failed: ${error}`);
    }
  };

  const handleDeleteVehicleClick = async (carId: number) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicle(carId);
        toast.success("Vehicle deleted.");
        fetchData(false);
      } catch (error) {
        toast.error(`Failed: ${error}`);
      }
    } else {
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        Loading customer details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 text-red-500 p-4 text-center">
        Error: {error}
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="container mx-auto py-6 text-center">
        Customer data could not be loaded.
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumb className="mb-2 px-1">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/customers">
                Quản lý khách hàng
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chi tiết khách hàng</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header with Quick Info */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {customerData.firstName} {customerData.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                {customerData.email && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>{customerData.email}</span>
                  </div>
                )}
                {customerData.phone && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{customerData.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                  <span className={customerData.isActive ? "text-green-600" : "text-red-600"}>
                    {customerData.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddVehicleModalOpen(true)}
                className="whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M6 9h12" />
                  <path d="M6 4v3" />
                  <path d="M18 4v3" />
                  <circle cx="9" cy="16" r="1" />
                  <circle cx="15" cy="16" r="1" />
                </svg>
                Thêm xe
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddContractModalOpen(true)}
                className="whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Tạo hợp đồng
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle section - 1/3 width */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-1 rounded-lg">
              <CustomerVehiclesTable
                vehicles={vehiclesData}
                onAddClickAction={() => setIsAddVehicleModalOpen(true)}
                onEditClickAction={handleEditVehicleClick}
                onDeleteClickAction={handleDeleteVehicleClick}
              />
            </div>

            <CustomerFeedbackList feedback={feedbackData} />
          </div>

          {/* Main content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <EditableCustomerInfoCard initialData={customerData} />

            <CustomerContractsTable
              contracts={contractsData}
              onAddContractClickAction={() => setIsAddContractModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={isAddContractModalOpen}
        onOpenChange={setIsAddContractModalOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Create New Contract for {customerData.firstName}{" "}
              {customerData.lastName}
            </DialogTitle>
          </DialogHeader>
          {customerData && vehiclesData && (
            <AddContractForm
              customerId={customerId}
              customerName={`${customerData.firstName} ${customerData.lastName}`}
              customerVehicles={vehiclesData} // Pass fetched vehicles
              onSubmitAction={handleAddContractSubmit}
              onCancelAction={() => setIsAddContractModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddVehicleModalOpen}
        onOpenChange={setIsAddVehicleModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm
            onSubmitAction={handleAddVehicleSubmit}
            onCancelAction={() => setIsAddVehicleModalOpen(false)}
            key="add-vehicle" // Ensure form resets if opened again
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditVehicleModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditingVehicle(null);
          setIsEditVehicleModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          {editingVehicle && (
            <VehicleForm
              onSubmitAction={handleUpdateVehicleSubmit}
              initialData={editingVehicle}
              onCancelAction={() => {
                setIsEditVehicleModalOpen(false);
                setEditingVehicle(null);
              }}
              key={`edit-vehicle-${editingVehicle.carId}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
