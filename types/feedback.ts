export interface Feedback {
  feedbackId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  content: string;
  createdAt: string;
  status: string;
  responsedContent: string;
  responsedAt: string
}

export enum FeedbackStatus {
  New = 'New',
  Viewed = 'Viewed', 
  Responsed = 'Responsed'
}