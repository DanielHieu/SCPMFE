import { AddFloorPayload, Floor, UpdateFloorPayload } from "@/types/floor";
import { fetchApi } from "./api-helper";

// GET /api/proxy/Floor/GetFloorsByArea?areaId={areaId} [cite: 116]
export async function getFloorsByArea(
  areaId: number | string,
): Promise<Floor[]> {
  console.log(`API Client: Fetching floors for area ${areaId} (via proxy)`);
  // Adjust return based on API response (e.g., response.data)
  return await fetchApi(`/Floor/GetFloorsByArea?areaId=${areaId}`);
}

export async function addFloor(payload: AddFloorPayload): Promise<Floor> {
  return await fetchApi(`/Floor/Add`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateFloor(payload: UpdateFloorPayload): Promise<Floor> {
  return await fetchApi(`/Floor/Update`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteFloor(id: number): Promise<void> {
  await fetchApi(`/Floor/${id}`, { method: "DELETE" });
}
