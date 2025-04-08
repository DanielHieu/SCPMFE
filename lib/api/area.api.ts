import { AddAreaPayload, Area, UpdateAreaPayload } from "@/types/area";
import { fetchApi } from "./api-helper";

// GET /api/proxy/Area/GetAreasByParkingLot?parkingLotId={lotId} [cite: 3]
export async function getAreasByLot(lotId: number | string): Promise<Area[]> {
  console.log(`API Client: Fetching areas for lot ${lotId} (via proxy)`);
  // Adjust return based on API response (e.g., response.data)
  return await fetchApi(`/Area/GetAreasByParkingLot?parkingLotId=${lotId}`);
}

// POST /api/proxy/Area/Add [cite: uploaded:API-docsc.txt, 5]
export async function addArea(payload: AddAreaPayload): Promise<Area> {
  // Assuming API returns created area
  console.log("API Client: Adding Area");
  return await fetchApi(`/Area/Add`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateArea(payload: UpdateAreaPayload): Promise<Area> {
  console.log("API Client: Updating area (real API)", payload);
  if (!payload.areaId) {
    throw new Error("Area ID is required for update");
  }
  return await fetchApi(`/Area/Update`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteArea(id: number): Promise<void> {
  await fetchApi(`/Area/${id}`, { method: "DELETE" });
}
