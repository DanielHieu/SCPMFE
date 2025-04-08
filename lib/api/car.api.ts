import { AddVehiclePayload, Car, UpdateVehiclePayload } from "@/types/car";
import { fetchApi } from "./api-helper";

//GET /api/Car/GetCarsOfCustomer?customerId={customerId}
export async function getCustomerVehicles(customerId: number): Promise<Car[]> {
  return await fetchApi(`/Car/GetCarsOfCustomer?customerId=${customerId}`, {
    method: "GET",
    cache: "no-store",
  });
}

// POST /api/proxy/Car/Add [cite: uploaded:API-docsc.txt, 37, 209]
export async function addVehicle(payload: AddVehiclePayload): Promise<Car> {
  // Assuming API returns the created vehicle
  return await fetchApi(`/Car/Add`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUT /api/proxy/Car/Update [cite: uploaded:API-docsc.txt, 40, 259]
export async function updateVehicle(
  payload: UpdateVehiclePayload,
): Promise<Car> {
  // Assuming API returns the updated vehicle
  // API requires carId and customerId in the body
  if (!payload.carId || !payload.customerId) {
    throw new Error("Car ID and Customer ID are required for update.");
  }
  return await fetchApi(`/Car/Update`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// DELETE /api/proxy/Car/{id} [cite: uploaded:API-docsc.txt, 44]
export async function deleteVehicle(carId: number): Promise<void> {
  const result = await fetchApi(`/Car/${carId}`, { method: "DELETE" });
}

// GET /api/proxy/Car/GetById?id={id} [cite: uploaded:API-docsc.txt, 33] (Optional, if needed for Edit prefill beyond row data)
export async function getVehicleById(carId: number): Promise<Car | null> {
  return await fetchApi(`/Car/GetById?id=${carId}`);
}
