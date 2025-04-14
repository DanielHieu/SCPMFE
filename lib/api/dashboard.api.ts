import { fetchApi } from "@/lib/api/api-helper";
import { WailkinDateRevenue } from "@/types/dashboard";

export const fetchWalkinTodayRevenue = async (): Promise<WailkinDateRevenue> => {
    console.log("Fetching walk-in today revenue data");

    const response = await fetchApi("/Report/GetWalkinTodayRevenue", { cache: 'no-store' });

    const data = response as WailkinDateRevenue;

    console.log("Walk-in today revenue data received:", data);

    return data;
};