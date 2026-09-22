export interface MealEventItem {
  eventId: string;
  eventName: string;
  staffCount: number | null;
}
export interface MealSendAttempt {
  id: string;
  status: "sending" | "sent" | "failed";
  sentAt?: number;
  errorMessage?: string;
  createdAt: number;
}
export interface MealOrder {
  mealDate: number;
  eventItems: MealEventItem[];
  suggestedQuantity: number;
  quantity: number;
  recipientId: string;
  recipientName: string;
  message: string;
}
export interface MealRecord extends MealOrder {
  id: string;
  sendStatus: MealSendAttempt["status"];
  sendAttempts: MealSendAttempt[];
  createdAt: number;
  updatedAt: number;
}
export type MealRecordEdit = Pick<
  MealOrder,
  "quantity" | "recipientId" | "recipientName" | "message"
>;
