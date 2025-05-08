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

/**
 * Lấy tất cả số lượng thống kê phản hồi trong một lần gọi
 * @returns Đối tượng chứa số lượng phản hồi theo từng trạng thái
 */
export async function getFeedbackCountStats(): Promise<{
  all: number;
  new: number;
  viewed: number;
  responsed: number;
}> {
  try {
    // Gọi endpoint mới trên server
    const response = await fetchApi('/Feedback/CountStats');
    return response;
  } catch (error) {
    console.error("Error fetching feedback count stats:", error);
    
    // Phương pháp dự phòng nếu API chưa được triển khai
    try {
      const [all, newCount, viewed, responsed] = await Promise.all([
        fetchApi('/Feedback/Count'),
        fetchApi('/Feedback/Count?status=New'),
        fetchApi('/Feedback/Count?status=Viewed'),
        fetchApi('/Feedback/Count?status=Responsed')
      ]);
      
      return {
        all: all.count || 0,
        new: newCount.count || 0,
        viewed: viewed.count || 0,
        responsed: responsed.count || 0
      };
    } catch (fallbackError) {
      console.error("Error with fallback counts method:", fallbackError);
      return { all: 0, new: 0, viewed: 0, responsed: 0 };
    }
  }
}
