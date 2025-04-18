import { Car } from "@/types/car";
import { fetchApi } from "./api-helper";

//GET /api/Car/GetCarsOfCustomer?customerId={customerId}
export async function getCustomerVehicles(customerId: number): Promise<Car[]> {
  return await fetchApi(`/Car/GetCarsOfCustomer?customerId=${customerId}`, {
    method: "GET",
    cache: "no-store",
  });
}

// GET /api/proxy/Car/GetById?id={id} [cite: uploaded:API-docsc.txt, 33] (Optional, if needed for Edit prefill beyond row data)
export async function getVehicleById(carId: number): Promise<Car | null> {
  return await fetchApi(`/Car/GetById?id=${carId}`);
}
