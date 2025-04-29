import {
  AddParkingSpacePayload,
  ParkingSpace,
  UpdateSpacePayload,
} from "@/types/parking-space";
import { fetchApi } from "./api-helper";
import { AddParkingStatusSensorPayload, ParkingStatusSensor, UpdateParkingStatusSensorPayload } from "@/types/parkingStatusSensor";

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

export async function getParkingStatusSensors(
): Promise<ParkingStatusSensor[]> {
  return await fetchApi(`/Sensor/GetAll`);
}

export async function addParkingStatusSensor(
  payload: AddParkingStatusSensorPayload,
): Promise<ParkingStatusSensor> {
  return await fetchApi(`/Sensor/Add`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateParkingStatusSensor(
  payload: UpdateParkingStatusSensorPayload,
): Promise<ParkingStatusSensor> {
  return await fetchApi(`/Sensor/Update`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteParkingStatusSensor(sensorId: number): Promise<void> {
  await fetchApi(`/Sensor/${sensorId}`, { method: "DELETE" });
}

export async function updateParkingSpace(
  payload: UpdateSpacePayload & { status?: string | number }
): Promise<ParkingSpace> {
  return await fetchApi(`/ParkingSpace/Update`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
