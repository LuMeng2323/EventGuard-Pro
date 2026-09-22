import type { Workbook } from "exceljs";
import type { Event } from "~/types/event";

export const createEventsWorkbook = async (
  events: Event[],
): Promise<Workbook> => {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Events");
  sheet.columns = [
    { header: "ID", key: "id", width: 20 },
    { header: "Event name", key: "name", width: 28 },
    { header: "Type", key: "type", width: 16 },
    { header: "Start date (UTC)", key: "startDate", width: 24 },
    { header: "End date (UTC)", key: "endDate", width: 24 },
    { header: "Venues", key: "venues", width: 32 },
    { header: "Organizer", key: "organizer", width: 24 },
    { header: "Manager", key: "manager", width: 24 },
    { header: "Phone", key: "phone", width: 20 },
    { header: "Area (m²)", key: "area", width: 18 },
    { header: "Expected visitors", key: "expectedVisitors", width: 20 },
    { header: "Note", key: "note", width: 40 },
    { header: "Created (UTC)", key: "createdAt", width: 24 },
    { header: "Updated (UTC)", key: "updatedAt", width: 24 },
  ];
  sheet.addRows(
    events.map((event) => ({
      ...event,
      venues: event.venues.join(", "),
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    })),
  );
  for (const key of ["startDate", "endDate", "createdAt", "updatedAt"])
    sheet.getColumn(key).numFmt = "yyyy-mm-dd hh:mm:ss";
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = "A1:N1";
  return workbook;
};
