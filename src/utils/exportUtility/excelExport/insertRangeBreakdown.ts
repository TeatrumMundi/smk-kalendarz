import ExcelJS from "exceljs";
import { ColoredRange } from "@/types/Period";
import { getWorkingDaysInRange } from "@/utils/helpers/getWorkingDaysInRange";
import { getCalendarDaysInRange } from "@/utils/helpers/getCalendarDaysInRange";
import { parseDateString } from "@/utils/helpers/dateHelpers"; // użyj swojego parsera

/**
 * Inserts a breakdown of ranges into the Excel sheet.
 * The ranges are sorted chronologically by start date.
 */
export const insertRangeBreakdown = (ws: ExcelJS.Worksheet, ranges: ColoredRange[]) => {
    ws.addRow([]);
    const headerRow = ws.addRow(["Zakres", "Typ", "Dni kalendarzowe", "Dni robocze"]);

    headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDDEEFF" }
        };
    });

    // ✅ Sort ranges chronologically by start date
    const sortedRanges = [...ranges].sort((a, b) => {
        const dateA = parseDateString(a.start);
        const dateB = parseDateString(b.start);
        return dateA.getTime() - dateB.getTime();
    });

    // ⬇️ Render each row after sorting
    sortedRanges.forEach(range => {
        const totalDays = range.totalDays ?? getCalendarDaysInRange(range.start, range.end);
        const workingDays = range.workingDays ?? getWorkingDaysInRange(range.start, range.end);
        const rangeText = range.start === range.end ? range.start : `${range.start} - ${range.end}`;
        ws.addRow([rangeText, range.type, totalDays, workingDays]);
    });
};
