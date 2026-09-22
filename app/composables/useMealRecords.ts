import type {
  MealOrder,
  MealRecord,
  MealRecordEdit,
  MealSendAttempt,
} from "~/types/meal";
import {
  cloneMealRecord,
  validMealOrder,
  validMealRecord,
} from "~/utils/mealCalculation";

export const useMealRecords = () => {
  const records = useState<MealRecord[]>("meal-order-records", () => []);
  const initialized = useState("meal-records-initialized", () => false);
  const available = useState("meal-records-available", () => false);
  const storageError = useState("meal-records-storage-error", () => "");
  const { send } = useMealSender();
  const key = "eventguard-meal-records-v1";
  const persist = (next: MealRecord[]) => {
    localStorage.setItem(key, JSON.stringify(next));
    records.value = next;
    storageError.value = "";
  };
  onMounted(() => {
    if (initialized.value) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (
          !Array.isArray(parsed) ||
          !parsed.every(validMealRecord) ||
          new Set(parsed.map((r) => r.id)).size !== parsed.length
        )
          throw new Error("Invalid meal record storage");
        // An interrupted request has an unknown outcome; never retry it automatically.
        const recovered = parsed.map((record) => {
          if (record.sendStatus !== "sending") return record;
          const copy = cloneMealRecord(record);
          const last = copy.sendAttempts.at(-1)!;
          last.status = "failed";
          last.errorMessage =
            "Send interrupted; delivery outcome is unknown. Check before sending again.";
          copy.sendStatus = "failed";
          copy.updatedAt = Date.now();
          return copy;
        });
        persist(recovered);
      }
      available.value = true;
    } catch {
      storageError.value =
        "Unable to load meal records. Saved data has been preserved.";
    }
    initialized.value = true;
  });
  const assertAvailable = () => {
    if (!available.value) throw new Error("Meal record storage is unavailable");
  };
  const find = (id: string) => {
    const record = records.value.find((r) => r.id === id);
    if (!record) throw new Error("Meal record no longer exists");
    return record;
  };
  const completeSend = async (record: MealRecord) => {
    let failure: string | undefined;
    try {
      await send(cloneMealRecord(record));
    } catch (cause) {
      failure = cause instanceof Error ? cause.message : "Sending failed";
    }
    const completed = cloneMealRecord(find(record.id));
    const attempt = completed.sendAttempts.at(-1)!;
    attempt.status = failure ? "failed" : "sent";
    if (failure) attempt.errorMessage = failure;
    else attempt.sentAt = Date.now();
    completed.sendStatus = attempt.status;
    completed.updatedAt = Date.now();
    const next = records.value.map((r) =>
      r.id === completed.id ? completed : r,
    );
    try {
      persist(next);
    } catch {
      records.value = next;
      storageError.value =
        "The attempt result could not be saved. The pending attempt is stored; do not resend without checking delivery.";
      available.value = false;
      throw new Error(storageError.value);
    }
    return cloneMealRecord(completed);
  };
  const newAttempt = (): MealSendAttempt => ({
    id: crypto.randomUUID(),
    status: "sending",
    createdAt: Date.now(),
  });
  const createAndSend = async (order: MealOrder) => {
    assertAvailable();
    if (!validMealOrder(order))
      throw new Error("Enter a valid whole meal quantity and message");
    const now = Date.now();
    const record: MealRecord = {
      ...order,
      eventItems: order.eventItems.map((item) => ({ ...item })),
      id: crypto.randomUUID(),
      sendStatus: "sending",
      sendAttempts: [newAttempt()],
      createdAt: now,
      updatedAt: now,
    };
    persist([...records.value, record]);
    return completeSend(record);
  };
  const resend = async (id: string) => {
    assertAvailable();
    const record = cloneMealRecord(find(id));
    if (record.sendStatus === "sending")
      throw new Error("This order is already sending");
    record.sendAttempts.push(newAttempt());
    record.sendStatus = "sending";
    record.updatedAt = Date.now();
    persist(records.value.map((r) => (r.id === id ? record : r)));
    return completeSend(record);
  };
  const edit = (id: string, changes: MealRecordEdit) => {
    assertAvailable();
    const existing = find(id);
    if (existing.sendStatus === "sending")
      throw new Error("Wait until sending finishes before editing");
    const record = {
      ...cloneMealRecord(existing),
      quantity: changes.quantity,
      recipientId: changes.recipientId,
      recipientName: changes.recipientName,
      message: changes.message,
      updatedAt: Date.now(),
    };
    if (!validMealRecord(record))
      throw new Error("Enter a valid whole meal quantity and message");
    persist(records.value.map((r) => (r.id === id ? record : r)));
  };
  return {
    records: readonly(records),
    history: computed(() =>
      [...records.value].sort((a, b) => b.createdAt - a.createdAt),
    ),
    available,
    storageError,
    createAndSend,
    resend,
    edit,
  };
};
