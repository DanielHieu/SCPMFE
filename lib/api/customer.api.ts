import {
  Customer,
  RegisterCustomerPayload,
  SearchCustomerPayload,
  UpdateCustomerPayload,
} from "@/types/customer";
import { fetchApi } from "./api-helper";

// POST /api/Customer/SearchCustomer
export async function searchCustomers(
  payload: SearchCustomerPayload,
): Promise<Customer[]> {

  return await fetchApi(`/Customer/SearchCustomer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyword: payload.keyword ? `${encodeURIComponent(payload.keyword)}` : ""
    }),
  });
}

// GET /api/Customer/GetById?id={id}
export async function getCustomerById(id: number): Promise<Customer | null> {
  return await fetchApi(`/Customer/GetById?id=${id}`);
}

// DELETE /api/Customer/{id}
export async function deleteCustomer(id: number): Promise<void> {
  await fetchApi(`/Customer/${id}`, { method: "DELETE" });
}

// POST /api/Customer/Register
export async function registerCustomer(
  data: RegisterCustomerPayload,
): Promise<Customer> {
  console.log("API Client: Registering customer (real API)", data);
  const response = await fetchApi(`/Customer/Register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
}

// PUT /api/Customer/Update
export async function updateCustomer(
  payload: UpdateCustomerPayload,
): Promise<Customer> {
  console.log("API Client: Updating customer (real API)", payload);
  if (!payload.customerId) {
    throw new Error("Customer ID is required for update");
  }

  const response = await fetchApi(`/Customer/Update`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response;
}

// WARN: Placeholder for Active Contract Count API
export async function getCustomerContractCount(
  customerId: number,
): Promise<number> {
  console.warn(`Using hardcoded contract count for customer ${customerId}`);
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (customerId === 1) return 1;
  if (customerId === 2) return 2;
  return 0;
}

// WARN: Placeholder for Pending Request Count API
export async function getCustomerPendingRequestCount(
  customerId: number,
): Promise<number> {
  console.warn(
    `Using hardcoded pending request count for customer ${customerId}`,
  );
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (customerId === 1) return 1;
  return 0;
}
