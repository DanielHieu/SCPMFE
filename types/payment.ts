export interface PaymentContract {
  paymentContractId: number;
  startDate: Date;
  endDate: Date;
  paymentAmount: number;
  paymentMethod: string;
  pricePerMonth: number;
  paymentDate: string; 
  status: string;
  note: string;
  createdDate: Date;
  updatedDate: Date;
  startDateString: string;
  endDateString: string;
}

export enum PaymentContractStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Paid = "Paid",
  Complete = "Completed",
}
