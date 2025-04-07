import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ColoredRange } from "@/types/Period";
import { getWorkingDaysInRange } from "@/utils/helpers/getWorkingDaysInRange";
import { parseDateString } from "@/utils/helpers/dateHelpers";
import { generateMainLeftSegment } from "@/utils/exportUtility/excelExport/populateMainStats";
import { insertRangeBreakdown } from "@/utils/exportUtility/excelExport/insertRangeBreakdown";
import { generateFileName } from "@/utils/exportUtility/excelExport/generateFileName";
import { getWorkingDaysByRangeType } from "@/utils/helpers/getWorkingDaysByRangeType";
import {insertDutyOverview} from "@/utils/exportUtility/excelExport/insertDutyOverview";


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