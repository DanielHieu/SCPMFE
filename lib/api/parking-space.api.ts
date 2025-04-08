import {
  AddParkingSpacePayload,
  ParkingSpace,
  UpdateSpacePayload,
} from "@/types/parking-space";
import { fetchApi } from "./api-helper";

// GET /api/proxy/ParkingSpace/GetParkingSpacesByFloor?floorId={floorId} [cite: 154]
export async function getParkingSpacesByFloor(
  floorId: number | string,
): Promise<ParkingSpace[]> {
  console.log(`API Client: Fetching spaces for floor ${floorId} (via proxy)`);
  // Adjust return based on API response (e.g., response.data)
  return await fetchApi(
    `/ParkingSpace/GetParkingSpacesByFloor?floorId=${floorId}`,
  );
}

export async function addSpace(
  payload: AddParkingSpacePayload,
): Promise<ParkingSpace> {
  return await fetchApi(`/ParkingSpace/Add`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSpace(
  payload: UpdateSpacePayload,
): Promise<ParkingSpace> {
  return await fetchApi(`/ParkingSpace/Update`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteSpace(spaceId: number): Promise<void> {
  await fetchApi(`/ParkingSpace/${spaceId}`, { method: "DELETE" });
}
