// components/features/parking-lots/[lotId]/AreaFloorSpaceManager.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

// Import Types
import {
  Area,
  Floor,
  ParkingSpace,
  AddAreaPayload,
  UpdateAreaPayload,
  AddFloorPayload,
  UpdateFloorPayload,
  AddParkingSpacePayload,
  UpdateSpacePayload,
} from "@/types";
import { toast } from "sonner";

// Import API Client Functions
import {
  getAreasByLot,
  getFloorsByArea,
  getParkingSpacesByFloor,
  addArea,
  updateArea,
  deleteArea,
  addFloor,
  updateFloor,
  deleteFloor,
  addSpace,
  updateSpace,
  deleteSpace,
} from "@/lib/api";

// Import UI Components & Icons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, PlusCircle } from "lucide-react";

// Import Child Components
import { AreaTable } from "./AreaTable";
import { FloorTable } from "./FloorTable";
import { SpaceTable } from "./SpaceTable";
import { AreaForm } from "./AreaForm";
import { FloorForm } from "./FloorForm";
import { SpaceForm } from "./SpaceForm";

// Data structure for the nested cache
interface NestedDataState<T> {
  data: T[];
  isLoading: boolean;
  error?: string | null;
}

// Props for the main manager component
interface AreaFloorSpaceManagerProps {
  initialAreas: Area[];
  lotId: number;
  // Optional parent refresh function if direct refresh isn't sufficient
  refreshParentData?: () => void;
}

export function AreaFloorSpaceManager({
  initialAreas,
  lotId,
  refreshParentData,
}: AreaFloorSpaceManagerProps) {
  const [expandedAreaId, setExpandedAreaId] = useState<number | null>(null); // <<< DECLARED
  const [expandedFloorId, setExpandedFloorId] = useState<number | null>(null); // <<< DECLARED

  const [isLoading, setIsLoading] = useState(false);

  // --- State ---
  const [areas, setAreas] = useState<Area[]>(initialAreas || []);
  const [expandedRowState, setExpandedRowState] = useState<
    Record<string, boolean>
  >({}); // Tracks "area-ID" and "floor-ID"
  const [nestedDataCache, setNestedDataCache] = useState<
    Record<string, NestedDataState<Floor | ParkingSpace>>
  >({});
  const [modalState, setModalState] = useState<{
    type: "add" | "edit" | null;
    entity: "area" | "floor" | "space" | null;
    data?: any;
  }>({ type: null, entity: null, data: null });
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  // Update local areas if initial prop changes
  useEffect(() => {
    setAreas(initialAreas || []);
  }, [initialAreas]);

  // --- Data Fetching & Caching ---
  const loadNestedData = useCallback(
    async (
      key: string,
      fetcher: () => Promise<any[]>,
      parentId: number | null,
      forceRefresh: boolean = false,
    ) => {
      if (parentId === null || nestedDataCache[key]?.isLoading) return; // Skip if no parent or already loading

      const currentCacheEntry = nestedDataCache[key]; // Read cache once
      const shouldFetch =
        forceRefresh ||
        (!currentCacheEntry?.isLoading && !currentCacheEntry?.data);

      // Fetch only if not already cached OR if forcing a refresh (e.g., after CRUD)
      if (shouldFetch) {
        // Adjust condition if empty cache needs refresh
        setNestedDataCache((prev) => ({
          ...prev,
          [key]: { data: [], isLoading: true, error: null },
        }));
        try {
          console.log(`Workspaceing data for ${key} (Force: ${forceRefresh})`);
          const data = await fetcher();
          setNestedDataCache((prev) => ({
            ...prev,
            [key]: {
              data: Array.isArray(data) ? data : [],
              isLoading: false,
              error: null,
            },
          }));
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Failed to load data";
          console.error(`Failed to fetch data for ${key}:`, error);
          setNestedDataCache((prev) => ({
            ...prev,
            [key]: { data: [], isLoading: false, error: errorMsg },
          }));
          toast.error(`Could not load nested data for ${key}.`);
        }
      } else if (!nestedDataCache[key]?.isLoading) {
        console.log(
          `Data for ${key} exists in cache, skipping fetch unless forced.`,
        );
      }
    },
    [toast, nestedDataCache],
  ); // Include cache in deps

  const loadFloorsForArea = useCallback(
    (areaId: number, force = false) => {
      loadNestedData(
        `area-${areaId}-floors`,
        () => getFloorsByArea(areaId),
        areaId,
        force,
      );
    },
    [loadNestedData],
  );

  const loadSpacesForFloor = useCallback(
    (floorId: number, force = false) => {
      loadNestedData(
        `floor-${floorId}-spaces`,
        () => getParkingSpacesByFloor(floorId),
        floorId,
        force,
      );
    },
    [loadNestedData],
  );

  const handleExpandFloor = useCallback(
    (floorId: number) => {
      const newExpandedId = expandedFloorId === floorId ? null : floorId;
      setExpandedFloorId(newExpandedId);
      if (newExpandedId !== null) {
        // Pass the correctly typed fetcher
        loadNestedData(
          `floor-${newExpandedId}-spaces`,
          () => getParkingSpacesByFloor(newExpandedId),
          newExpandedId,
        );
      }
    },
    [expandedFloorId, loadNestedData],
  ); // Removed fetchSpaces

  // --- Expansion Handlers ---
  const handleExpandArea = useCallback(
    (areaId: number) => {
      const newExpandedId = expandedAreaId === areaId ? null : areaId;
      setExpandedAreaId(newExpandedId);
      setExpandedFloorId(null);
      if (newExpandedId !== null) {
        // Pass the correctly typed fetcher
        loadNestedData(
          `area-${newExpandedId}-floors`,
          () => getFloorsByArea(newExpandedId),
          newExpandedId,
        );
      }
    },
    [expandedAreaId, loadNestedData],
  );

  // --- Expansion Toggle ---
  const toggleExpand = (
    id: string,
    type: "area" | "floor",
    entityId: number,
  ) => {
    const isCurrentlyExpanded = !!expandedRowState[id];
    const newExpandedState = !isCurrentlyExpanded;

    // Collapse children when collapsing parent
    const newExpansionState = { ...expandedRowState, [id]: newExpandedState };
    if (!newExpandedState) {
      if (type === "area") {
        Object.keys(expandedRowState).forEach((key) => {
          if (
            key.startsWith(`floor-`) &&
            nestedDataCache[`area-${entityId}-floors`]?.data.some(
              (f: any) => `floor-${f.floorId}` === key,
            )
          ) {
            newExpansionState[key] = false; // Collapse floors of this area
          }
        });
      }
      // Add similar logic for collapsing spaces if a floor is collapsed
    }
    setExpandedRowState(newExpansionState);

    // Fetch data only when expanding
    if (newExpandedState) {
      if (type === "area") {
        loadFloorsForArea(entityId);
      } else if (type === "floor") {
        loadSpacesForFloor(entityId);
      }
    }
  };

  // --- Refresh Functions ---
  const handleRefreshAreas = useCallback(async () => {
    try {
      setIsLoading(true); // Indicate loading for the main list
      const data = await getAreasByLot(lotId);
      setAreas(Array.isArray(data) ? data : []);
      // Optionally clear nested cache if area list changes significantly
      // setNestedDataCache({});
      // setExpandedRowState({});
    } catch (e) {
      console.error(e);
      toast.error("Error refreshing areas");
    } finally {
      setIsLoading(false);
    }
  }, [lotId, toast]);

  const handleRefreshFloors = useCallback(
    (areaId: number | null) => {
      if (areaId !== null) {
        // Force refetch by clearing cache entry first then loading
        setNestedDataCache((prev) => {
          const newState = { ...prev };
          delete newState[`area-${areaId}-floors`];
          return newState;
        });
        loadFloorsForArea(areaId, true);
      }
    },
    [loadFloorsForArea],
  );

  const handleRefreshSpaces = useCallback(
    (floorId: number | null) => {
      if (floorId !== null) {
        // Force refetch by clearing cache entry first then loading
        setNestedDataCache((prev) => {
          const newState = { ...prev };
          delete newState[`floor-${floorId}-spaces`];
          return newState;
        });
        loadSpacesForFloor(floorId, true);
      }
    },
    [loadSpacesForFloor],
  );

  // --- CRUD Handlers ---
  const openModal = (
    type: "add" | "edit",
    entity: "area" | "floor" | "space",
    data?: any,
  ) => setModalState({ type, entity, data });
  const closeModal = () =>
    setModalState({ type: null, entity: null, data: null });

  const handleAddSubmit = async (formData: any) => {
    setIsSubmittingModal(true);
    const { entity, data: modalContextData } = modalState;
    try {
      let success = false;
      if (entity === "area") {
        await addArea({ ...formData, parkingLotId: lotId });
        handleRefreshAreas();
        success = true;
      }
      if (entity === "floor") {
        await addFloor({ ...formData, areaId: modalContextData?.areaId });
        handleRefreshFloors(modalContextData?.areaId);
        success = true;
      }
      if (entity === "space") {
        await addSpace({ ...formData, floorId: modalContextData?.floorId });
        handleRefreshSpaces(modalContextData?.floorId);
        success = true;
      }

      if (success) {
        toast.success(`${entity} added.`);
        closeModal();
      } else {
        throw new Error("Invalid entity type for add.");
      }
    } catch (error) {
      toast.error(`Failed: ${error}`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    setIsSubmittingModal(true);
    const { entity, data: itemData } = modalState;
    let success = false;
    try {
      let payload: any;
      let areaIdToRefresh: number | null = null;
      let floorIdToRefresh: number | null = null;

      if (entity === "area") {
        payload = {
          ...formData,
          parkingLotId: lotId,
          areaId: itemData?.areaId,
        };
        await updateArea(payload);
        handleRefreshAreas();
        success = true;
      }
      if (entity === "floor") {
        payload = {
          ...formData,
          areaId: itemData?.areaId,
          floorId: itemData?.floorId,
        };
        await updateFloor(payload);
        areaIdToRefresh = itemData?.areaId;
        handleRefreshFloors(areaIdToRefresh);
        success = true;
      }
      if (entity === "space") {
        payload = {
          ...formData,
          floorId: itemData?.floorId,
          parkingSpaceId: itemData?.parkingSpaceId,
        };
        await updateSpace(payload);
        floorIdToRefresh = itemData?.floorId;
        handleRefreshSpaces(floorIdToRefresh);
        success = true;
      }

      if (success) {
        toast.success(`${entity} updated.`);
        closeModal();
      } else {
        throw new Error("Invalid entity type for edit.");
      }
    } catch (error) {
      toast.error(`Failed: ${error}`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleDelete = async (
    entity: "area" | "floor" | "space",
    id: number,
    parentData?: { areaId?: number; floorId?: number },
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${entity}? This cannot be undone.`,
      )
    )
      return;
    setIsSubmittingModal(true); // Indicate loading/submitting
    try {
      if (entity === "area") {
        await deleteArea(id);
        handleRefreshAreas();
      }
      if (entity === "floor") {
        await deleteFloor(id);
        handleRefreshFloors(parentData?.areaId ?? null);
      } // Need areaId
      if (entity === "space") {
        await deleteSpace(id);
        handleRefreshSpaces(parentData?.floorId ?? null);
      } // Need floorId

      toast.success(`${entity} deleted.`);
    } catch (error) {
      toast.error(`Failed: ${error}`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // --- Render Logic ---
  return (
    <>
      {" "}
      {/* Use Fragment to render Card and Modals at same level */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Areas Management
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal("add", "area")}
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Add Area
          </Button>
        </CardHeader>
        <CardContent>
          {/* Render the top-level AreaTable */}
          <AreaTable
            areas={areas}
            expandedAreaId={expandedAreaId}
            onExpandClick={handleExpandArea}
            onEditArea={(area) => openModal("edit", "area", area)}
            // Pass areaId directly to delete handler
            onDeleteArea={(id) => handleDelete("area", id)}
            // Pass areaId needed for adding floor
            onAddFloorClick={(areaId) => openModal("add", "floor", { areaId })}
          />

          {/* Render expanded floor data ONLY IF an area is expanded */}
          {expandedAreaId !== null && (
            <div className="mt-4 pl-6 border-l-2 ml-2">
              {" "}
              {/* Indentation */}
              {/* Pass floor data and handlers */}
              <FloorTable
                floors={
                  (nestedDataCache[`area-${expandedAreaId}-floors`]?.data ||
                    []) as Floor[]
                }
                isLoading={
                  !!nestedDataCache[`area-${expandedAreaId}-floors`]?.isLoading
                }
                expandedFloorId={expandedFloorId}
                onExpandClick={handleExpandFloor}
                onEditFloor={(floor) => openModal("edit", "floor", floor)}
                // Pass floorId and areaId (needed for refresh) to delete handler or manage differently
                onDeleteFloor={(id) =>
                  handleDelete("floor", id, { areaId: expandedAreaId })
                }
                onAddSpaceClick={(floorId) =>
                  openModal("add", "space", { floorId })
                }
              />
              {/* Render expanded space data ONLY IF a floor is expanded */}
              {expandedFloorId !== null && (
                <div className="mt-4 pl-6 border-l-2 ml-2">
                  {" "}
                  {/* Further Indentation */}
                  {/* Pass space data and handlers */}
                  <SpaceTable
                    spaces={
                      (nestedDataCache[`floor-${expandedFloorId}-spaces`]
                        ?.data || []) as ParkingSpace[]
                    }
                    isLoading={
                      !!nestedDataCache[`floor-${expandedFloorId}-spaces`]
                        ?.isLoading
                    }
                    onEditSpace={(space) => openModal("edit", "space", space)}
                    // Pass spaceId and floorId (needed for refresh) to delete handler
                    onDeleteSpace={(id) =>
                      handleDelete("space", id, { floorId: expandedFloorId })
                    }
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* --- Modals --- */}
      <Dialog
        open={modalState.type === "add" || modalState.type === "edit"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalState.type === "add" ? "Add New" : "Edit"}{" "}
              {modalState.entity}
            </DialogTitle>
          </DialogHeader>
          {/* Conditionally render the correct form based on modalState */}
          {modalState.entity === "area" && (
            <AreaForm
              onSubmitAction={
                modalState.type === "add" ? handleAddSubmit : handleEditSubmit
              }
              onCancelAction={closeModal}
              initialData={modalState.type === "edit" ? modalState.data : null}
              key={`area-form-${modalState.data?.areaId ?? "add"}`}
              isSubmitting={isSubmittingModal}
            />
          )}
          {modalState.entity === "floor" && (
            <FloorForm
              onSubmitAction={
                modalState.type === "add" ? handleAddSubmit : handleEditSubmit
              }
              onCancelAction={closeModal}
              initialData={modalState.type === "edit" ? modalState.data : null}
              key={`floor-form-${modalState.data?.floorId ?? "add"}`}
              isSubmitting={isSubmittingModal}
            />
          )}
          {modalState.entity === "space" && (
            <SpaceForm
              onSubmitAction={
                modalState.type === "add" ? handleAddSubmit : handleEditSubmit
              }
              onCancelAction={closeModal}
              initialData={modalState.type === "edit" ? modalState.data : null}
              key={`space-form-${modalState.data?.parkingSpaceId ?? "add"}`}
              isSubmitting={isSubmittingModal}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Note: Delete uses window.confirm, could be moved to a Dialog */}
    </>
  );
}
