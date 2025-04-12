// POST /api/proxy/ParkingLot/Search

import {
  AddParkingLotPayload,
  ParkingLot,
  ParkingLotSummaries,
  SearchParkingLotPayload,
  UpdateParkingLotPayload,
} from "@/types/parking-lot";
import { fetchApi } from "./api-helper";

// Accepts a search term (string) or null/undefined to get all lots.
export async function searchParkingLots(
  searchTerm: string | null | undefined,
): Promise<ParkingLot[]> {
  const keyword = searchTerm ?? ""; // Use empty string if searchTerm is null/undefined
  console.log(
    `API Client: Searching parking lots with keyword: "${keyword}" (via proxy)`,
  );

  const payload: SearchParkingLotPayload = {
    keyword: keyword, // Send empty string to get all, or the term to search
  };

  // Make the POST request with the keyword in the body
  // Adjust return based on actual API response structure (e.g., response.data)
  return await fetchApi(`/ParkingLot/Search`, {
    // Note: No query parameter here
    method: "POST",
    body: JSON.stringify(payload), // Send payload in the body
  });
}

// POST /api/proxy/ParkingLot/Add
export async function addParkingLot(
  payload: AddParkingLotPayload,
): Promise<ParkingLot> {
  return await fetchApi(`/ParkingLot/Add`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUT /api/proxy/ParkingLot/Update
export async function updateParkingLot(
  payload: UpdateParkingLotPayload,
): Promise<ParkingLot> {
  if (!payload.parkingLotId) throw new Error("ID required");
  return await fetchApi(`/ParkingLot/Update`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// DELETE /api/proxy/ParkingLot/{id}
export async function deleteParkingLot(id: number): Promise<void> {
  await fetchApi(`/ParkingLot/${id}`, { method: "DELETE" });
}

// GET /api/proxy/ParkingLot/GetById?id={id}
export async function getParkingLotById(
  id: number,
): Promise<ParkingLot | null> {
  return await fetchApi(`/ParkingLot/GetById?id=${id}`, { cache: "no-store" });
}

// GET /api/proxy/ParkingLot/{id}/Summaries
export async function getParkingLotSummaries(id: number): Promise<ParkingLotSummaries | null> {
  return await fetchApi(`/ParkingLot/${id}/Summaries`, { cache: "no-store" });
}
