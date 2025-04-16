import {
  RegisterStaffPayload,
  SearchStaffPayload,
  Staff,
  UpdateStaffPayload,
} from "@/types/staff";
import { fetchApi } from "./api-helper";

// POST /api/proxy/Staff/SearchStaff?Keyword=...
export async function searchStaff(
  payload: SearchStaffPayload,
): Promise<Staff[]> {
  // Adjust return based on actual nested structure if any (e.g., response.data)
  return await fetchApi(`/Staff/SearchStaff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyword: payload.keyword ? `${encodeURIComponent(payload.keyword)}` : ""
    }),
  });
}

// POST /api/proxy/Staff/Register
export async function registerStaff(
  payload: RegisterStaffPayload,
): Promise<Staff> {
  // Assuming API returns the created staff member
  // Adjust return based on actual nested structure if any (e.g., response.data)
  return await fetchApi(`/Staff/Register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// DELETE /api/proxy/Staff/{id}
export async function deleteStaff(staffAccountId: number): Promise<void> {
  await fetchApi(`/Staff/${staffAccountId}`, { method: "DELETE" });
}

// PUT /api/proxy/Staff/Update (For Edit functionality later)
export async function updateStaff(payload: UpdateStaffPayload): Promise<Staff> {
  // Adjust return based on actual nested structure if any (e.g., response.data)
  return await fetchApi(`/Staff/Update`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// GET /api/proxy/Staff/GetById?id={id} (For Edit functionality later)
export async function getStaffById(
  staffAccountId: number,
): Promise<Staff | null> {
  // Adjust return based on actual nested structure if any (e.g., response.data)
  return await fetchApi(`/Staff/GetById?id=${staffAccountId}`);
}
