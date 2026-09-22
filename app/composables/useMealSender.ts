import type { MealOrder } from "~/types/meal";
export const useMealSender = () => {
  // Future implementation must call a server endpoint; provider credentials stay server-side.
  const send = async (order: MealOrder): Promise<void> => {
    void order;
    throw new Error(
      "Sending integration is not configured. No message was sent.",
    );
  };
  return { send };
};
