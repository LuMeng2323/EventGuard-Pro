import type { Event } from "~/types/event";
import { createEventsWorkbook } from "~/utils/exportEvents";
export const useEventExport = () => {
  const exporting = ref(false);
  const exportEvents = async (events: Event[]) => {
    if (exporting.value) return;
    if (!events.length) {
      ElMessage.info("No events to export");
      return;
    }
    exporting.value = true;
    try {
      const book = await createEventsWorkbook(events);
      const buffer = await book.xlsx.writeBuffer();
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(buffer)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "events.xlsx";
      document.body.appendChild(link);
      try {
        link.click();
      } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      ElMessage.error("Unable to export events");
    } finally {
      exporting.value = false;
    }
  };
  return { exporting, exportEvents };
};
