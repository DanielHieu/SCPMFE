export interface PaymentContract {
  paymentContractId: number;
  startDate: string;
  endDate: string;
  paymentAmount: number;
  paymentMethod: string;
  pricePerMonth: number;
  paymentDate: string; 
  status: string;
  note: string;
  createdDate: Date;
  updatedDate: Date;
}

export enum PaymentContractStatus {
  Pending,
  Approved,
  Rejected,
  Paid,
  Complete,
}
