import { AddContractPayload, Contract } from "@/types/contract";
import { fetchApi } from "./api-helper";
import { PaymentContract } from "@/types";

//GET api/proxy/Contract/GetContractsOfCustomer?customerId={customerId}
export async function searchContracts(
  {
    keyword,
  }: {
    keyword: string;
  }
): Promise<Contract[]> {
  return await fetchApi(
    `/Contract/SearchContracts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword: keyword,
      }),
    }
  );
}

// POST /api/proxy/Contract/AddContract [cite: uploaded:API-docsc.txt, 57]
export async function addContract(
  payload: AddContractPayload,
): Promise<Contract> {
  // Use specific return type if known
  console.log("API Client: Adding contract (via proxy)", payload);
  return await fetchApi(`/Contract/AddContract`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const getPaymentContracts = async (contractId: number): Promise<PaymentContract[]> => {
  return await fetchApi(`/Contract/${contractId}/PaymentContracts`, {
    method: "GET",
  });
};
