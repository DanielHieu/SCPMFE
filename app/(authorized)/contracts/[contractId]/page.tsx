
import React from "react";
import ContractDetailComponent from "@/components/contracts/ContractDetailComponent";

interface ContractDetailPageProps {
  params: {
    contractId: number;
  };
}

const ContractDetailPage = async ({ params }: ContractDetailPageProps) => {
  const { contractId } = await params;
  return <ContractDetailComponent contractId={contractId} />;
};

export default ContractDetailPage;
