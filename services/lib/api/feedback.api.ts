import { Feedback } from "@/types/feedback";
import { fetchApi } from "./api-helper";

// GET /api/proxy/Feedback/GetFeedbacksOfCustomer?customerId={customerId}
export async function getCustomerFeedback(
  customerId: number,
): Promise<Feedback[]> {
  // Use specific Feedback type
  return await fetchApi(
    `/Feedback/GetFeedbacksOfCustomer?customerId=${customerId}`,
  );
}
