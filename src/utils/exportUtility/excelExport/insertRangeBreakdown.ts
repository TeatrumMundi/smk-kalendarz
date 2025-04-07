import ExcelJS from "exceljs";
import {ColoredRange} from "@/types/Period";
import {getWorkingDaysInRange} from "@/utils/helpers/getWorkingDaysInRange";
import {getCalendarDaysInRange} from "@/utils/helpers/getCalendarDaysInRange";
import {parseDateString} from "@/utils/helpers/dateHelpers";

export const insertRangeBreakdown = (ws: ExcelJS.Worksheet, ranges: ColoredRange[]) => {
    let currentRow: number = 20;

    // 🔹 NAGŁÓWEK
    ws.getRow(currentRow).values = ["Zakres", "Typ", "Dni kalendarzowe", "Dni robocze"];
    ws.getRow(currentRow).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDDEEFF" }
        };
    });

    currentRow++;

    // 🔹 Sort ranges chronologicznie
    const sortedRanges = [...ranges].sort((a, b) => {
        const dateA = parseDateString(a.start);
        const dateB = parseDateString(b.start);
        return dateA.getTime() - dateB.getTime();
    });

    // 🔹 Wiersze z danymi (bez specjalnych)
    sortedRanges
        .filter(range => !range.special)
        .forEach(range => {
            const totalDays = range.totalDays ?? getCalendarDaysInRange(range.start, range.end);
            const workingDays = range.workingDays ?? getWorkingDaysInRange(range.start, range.end);
            const rangeText = range.start === range.end ? range.start : `${range.start} - ${range.end}`;
            ws.getRow(currentRow).values = [rangeText, range.type, totalDays, workingDays];
            currentRow++;
        });
};
