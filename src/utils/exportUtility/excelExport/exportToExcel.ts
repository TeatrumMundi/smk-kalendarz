import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ColoredRange } from "@/types/Period";
import { getWorkingDaysInRange } from "@/utils/helpers/getWorkingDaysInRange";
import { parseDateString } from "@/utils/helpers/dateHelpers";
import { generateMainLeftSegment } from "@/utils/exportUtility/excelExport/populateMainStats";
import { insertRangeBreakdown } from "@/utils/exportUtility/excelExport/insertRangeBreakdown";
import { generateFileName } from "@/utils/exportUtility/excelExport/generateFileName";
import { getWorkingDaysByRangeType } from "@/utils/helpers/getWorkingDaysByRangeType";
import { insertDutyOverview } from "@/utils/exportUtility/excelExport/insertDutyOverview";
import { eachDayOfInterval, format, isWeekend } from 'date-fns';
import { isPolishHoliday } from "@/utils/helpers/polishHolidays";

export const exportToExcel = async (
    coloredRanges: ColoredRange[],
    periods: Array<{ start: string; end: string }>,
    personalInfo: { firstName: string; lastName: string }
): Promise<void> => {
    try {
        const workbook = new ExcelJS.Workbook();

        console.log(coloredRanges);

        // === 1. Summary Sheet
        const summarySheet = workbook.addWorksheet("Suma");
        const allWorkingDays = periods.reduce((sum, p) => sum + getWorkingDaysInRange(p.start, p.end), 0);
        const { workingDaysByType: summaryTypes } = getWorkingDaysByRangeType(coloredRanges);

        generateMainLeftSegment(summarySheet, personalInfo, allWorkingDays, summaryTypes);
        insertRangeBreakdown(summarySheet, coloredRanges);

        const allDuties = coloredRanges.filter(r => r.special && r.type === "Dyżur");
        insertDutyOverview(summarySheet, allDuties, periods);

        // Dodajemy wszystkie dni ze wszystkich okresów
        let rowIndex = summarySheet.lastRow ? summarySheet.lastRow.number + 2 : 1;
        summarySheet.getCell(`A${rowIndex}`).value = "Wszystkie dni z okresów";
        summarySheet.getCell(`A${rowIndex}`).font = { bold: true };

        periods.forEach((period, index) => {
            const periodStart = parseDateString(period.start);
            const periodEnd = parseDateString(period.end);

            const days = eachDayOfInterval({ start: periodStart, end: periodEnd })
                .filter(day => {
                    const isInColoredRanges = coloredRanges.some(range => {
                        const rangeStart = parseDateString(range.start);
                        const rangeEnd = parseDateString(range.end);
                        return day >= rangeStart && day <= rangeEnd;
                    });
                    return !isWeekend(day) && !isPolishHoliday(day) && !isInColoredRanges; // Pomijamy weekendy, święta i dni z coloredRanges
                });

            const color = getColorForYear(index); // Pobieramy kolor dla danego roku

            days.forEach(day => {
                rowIndex++;
                const cell = summarySheet.getCell(`A${rowIndex}`);
                cell.value = format(day, 'yyyy-MM-dd');
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: color }
                };
            });
        });

        // === 2. Yearly Sheets
        periods.forEach((period, index) => {
            const periodStart = parseDateString(period.start);
            const periodEnd = parseDateString(period.end);

            const filteredRanges = coloredRanges.filter(range => {
                const rangeStart = parseDateString(range.start);
                const rangeEnd = parseDateString(range.end);
                return rangeEnd >= periodStart && rangeStart <= periodEnd;
            });

            const totalWorkingDays = getWorkingDaysInRange(period.start, period.end);
            const { workingDaysByType } = getWorkingDaysByRangeType(filteredRanges);

            const sheet = workbook.addWorksheet(`Rok ${index + 1}`);
            generateMainLeftSegment(sheet, personalInfo, totalWorkingDays, workingDaysByType);
            insertRangeBreakdown(sheet, filteredRanges);

            const days = eachDayOfInterval({ start: periodStart, end: periodEnd })
                .filter(day => {
                    const isInColoredRanges = filteredRanges.some(range => {
                        const rangeStart = parseDateString(range.start);
                        const rangeEnd = parseDateString(range.end);
                        return day >= rangeStart && day <= rangeEnd;
                    });
                    return !isWeekend(day) && !isPolishHoliday(day) && !isInColoredRanges; // Pomijamy weekendy, święta i dni z coloredRanges
                });

            sheet.getColumn(10).values = ['Okres podstawowy', ...days.map(day => format(day, 'yyyy-MM-dd'))];
            sheet.getColumn(10).width = 20; // Ustawienie szerokości kolumny 10 na 20

            const dyzury = filteredRanges.filter(r => r.special && r.type === "Dyżur");
            insertDutyOverview(sheet, dyzury, periods);
        });

        const fileName = generateFileName(personalInfo);
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        saveAs(blob, fileName);
    }
    catch (error)
    {
        console.error("Failed to export to Excel:", error);
        alert("Wystąpił błąd podczas eksportu do Excela.");
    }
};

/**
 * Returns a color for a given year index.
 * @param {number} index - The index of the year (0-based)
 * @returns {string} A color in ARGB format
 */
function getColorForYear(index: number): string {
    const colors = [
        'FFFFC000', // Złoty
        'FF92D050', // Zielony
        'FF00B0F0', // Niebieski
        'FFFF0000', // Czerwony
        'FF7030A0', // Fioletowy
        'FF00FF00', // Jasnozielony
        'FF0070C0', // Ciemnoniebieski
        'FFFFA500', // Pomarańczowy
        'FF8B0000', // Ciemnoczerwony
        'FF4682B4'  // Stalowoniebieski
    ];
    return colors[index % colors.length];
}