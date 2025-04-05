import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ColoredRange } from "@/types/Period";
import { getWorkingDaysInRange } from "@/utils/helpers/getWorkingDaysInRange";
import { parseDateString } from "@/utils/helpers/dateHelpers";
import { createLoadingOverlay, removeExistingOverlays } from "@/utils/animations/loadingOverlay";
import { setupSheetHeader } from "@/utils/exportUtility/excelExport/setupSheetHeader";
import { populateMainStats } from "@/utils/exportUtility/excelExport/populateMainStats";
import { insertRangeBreakdown } from "@/utils/exportUtility/excelExport/insertRangeBreakdown";
import { generateFileName } from "@/utils/exportUtility/excelExport/generateFileName";
import {legendItems} from "@/config/legendConfig";

const allTypes = legendItems.map(item => item.label);

/**
 * Calculates total working days per legend type and overall sum.
 *
 * @param ranges - Array of ColoredRanges
 * @returns Object with days grouped by type and total sum
 */
const calculateWorkingDaysByType = (ranges: ColoredRange[]) => {
    const workingDaysByType: Record<string, number> = {};
    let total = 0;

    for (const range of ranges) {
        const days = range.workingDays ?? getWorkingDaysInRange(range.start, range.end);
        workingDaysByType[range.type] = (workingDaysByType[range.type] || 0) + days;
        total += days;
    }

    return { workingDaysByType, totalColoredRangeDays: total };
};

/**
 * Calculates total working days across all base periods.
 *
 * @param periods - Array of base periods
 * @returns Number of working days
 */
const calculateTotalWorkingDays = (periods: Array<{ start: string; end: string }>) =>
    periods.reduce((sum, p) => sum + getWorkingDaysInRange(p.start, p.end), 0);

/**
 * Exports colored range and period data to an Excel file.
 * Each base period gets its own worksheet, and a summary sheet is generated.
 *
 * @param coloredRanges - List of all colored ranges
 * @param periods - Base periods for each year
 * @param personalInfo - User's personal data used for file metadata
 */
export const exportToExcel = async (
    coloredRanges: ColoredRange[],
    periods: Array<{ start: string; end: string }>,
    personalInfo: { firstName: string; lastName: string }
): Promise<void> => {
    try {
        // Show loading overlay
        const loading = createLoadingOverlay({ message: 'Generowanie Excel...' });
        loading.updateProgress(10);

        const workbook = new ExcelJS.Workbook();

        // Loop through each base period to generate separate sheets per year
        periods.forEach((period, index) => {
            const periodStart = parseDateString(period.start);
            const periodEnd = parseDateString(period.end);

            // Filter colored ranges that intersect with this base period
            const filteredRanges = coloredRanges.filter(range => {
                const rangeStart = parseDateString(range.start);
                const rangeEnd = parseDateString(range.end);
                return rangeEnd >= periodStart && rangeStart <= periodEnd;
            });

            const totalWorkingDays = getWorkingDaysInRange(period.start, period.end);
            const { workingDaysByType } = calculateWorkingDaysByType(filteredRanges);

            // Create a worksheet for this period
            const worksheet = workbook.addWorksheet(`Rok ${index + 1}`);
            setupSheetHeader(worksheet, personalInfo); // header & metadata
            populateMainStats(worksheet, totalWorkingDays, workingDaysByType, allTypes);
            insertRangeBreakdown(worksheet, filteredRanges); // detailed breakdown
        });

        // Create the summary sheet with all data
        const allWorkingDays = calculateTotalWorkingDays(periods);
        const { workingDaysByType: summaryTypes } = calculateWorkingDaysByType(coloredRanges);
        const summarySheet = workbook.addWorksheet("Suma");
        setupSheetHeader(summarySheet, personalInfo);
        populateMainStats(summarySheet, allWorkingDays, summaryTypes, allTypes);
        insertRangeBreakdown(summarySheet, coloredRanges);

        loading.updateProgress(90);

        // Save workbook to file
        const fileName = generateFileName(personalInfo);
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        saveAs(blob, fileName);
        loading.updateProgress(100);
        setTimeout(() => loading.close(), 500);

    } catch (error) {
        console.error("Failed to export to Excel:", error);
        removeExistingOverlays();
        alert("Wystąpił błąd podczas eksportu do Excela.");
    }
};
