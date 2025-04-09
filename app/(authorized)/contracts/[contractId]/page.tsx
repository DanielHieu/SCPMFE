import React from "react";
import ContractDetailComponent from "@/components/contracts/ContractDetailComponent";

type Params = Promise<{ contractId: number }>

const ContractDetailPage = async ({
  params,
}: {
  params: Params;
}) => {
  const { contractId } = await params;
  return <ContractDetailComponent contractId={contractId} />;
};

export default ContractDetailPage;
