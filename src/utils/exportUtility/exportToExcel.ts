import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ColoredRange } from "@/types/Period";
import { getWorkingDaysInRange } from "@/utils/helpers/getWorkingDaysInRange";
import { createLoadingOverlay, removeExistingOverlays } from "@/utils/animations/loadingOverlay";

/**
 * Formats a date string to DD/MM/YYYY if it's in ISO format
 */
const formatDateIfNeeded = (dateStr: string): string => {
    // Check if date is in ISO format (YYYY-MM-DD)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }
    return dateStr;
};

/**
 * Calculate working days for a given period
 */
const calculateWorkingDays = (start: string, end: string): number => {
    const startFormatted = formatDateIfNeeded(start);
    const endFormatted = formatDateIfNeeded(end);
    return getWorkingDaysInRange(startFormatted, endFormatted);
};

/**
 * Calculate total working days across all periods
 */
const calculateTotalWorkingDays = (periods: Array<{ start: string; end: string }>): number => {
    return periods.reduce((total, period) => {
        return total + calculateWorkingDays(period.start, period.end);
    }, 0);
};

/**
 * Group colored ranges by type and calculate their days
 */
const calculateWorkingDaysByType = (coloredRanges: ColoredRange[]): {
    workingDaysByType: Record<string, number>;
    totalColoredRangeDays: number;
} => {
    const workingDaysByType: Record<string, number> = {};
    let totalColoredRangeDays = 0;

    coloredRanges.forEach(range => {
        if (!workingDaysByType[range.type]) {
            workingDaysByType[range.type] = 0;
        }

        const workingDays = calculateWorkingDays(range.start, range.end);
        workingDaysByType[range.type] += workingDays;
        totalColoredRangeDays += workingDays;
    });

    return { workingDaysByType, totalColoredRangeDays };
};

/**
 * Generate sanitized file name with timestamp
 */
const generateFileName = (personalInfo: { firstName: string, lastName: string }): string => {
    const sanitizedFirstName = (personalInfo.firstName || 'user').replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedLastName = (personalInfo.lastName || 'report').replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    return `${sanitizedFirstName}_${sanitizedLastName}_SMK_${timestamp}.xlsx`;
};

/**
 * Apply styling to the Excel worksheet
 */
const applyWorksheetStyling = (
    worksheet: ExcelJS.Worksheet,
    personalInfo: { firstName: string, lastName: string }
): void => {
    // Set column widths
    worksheet.columns = [
        { header: '', key: 'type', width: 20 },
        { header: '', key: 'days', width: 20 }
    ];

    // Add header with personal info
    worksheet.addRow([`Statystyki dla: ${personalInfo.firstName} ${personalInfo.lastName}`]);
    worksheet.addRow([]); // Empty row

    // Merge cells for the empty row
    worksheet.mergeCells('A2:B2');

    // Style the header
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    worksheet.getCell('A2').font = { bold: true, size: 15 };

    // Add column headers
    worksheet.addRow(['Typ', 'Liczba dni (roboczych)']);
    worksheet.getCell('A3').font = { bold: true };
    worksheet.getCell('B3').font = { bold: true };
};

/**
 * Add data rows to the worksheet
 */
const populateWorksheetData = (
    worksheet: ExcelJS.Worksheet,
    totalWorkingDays: number,
    workingDaysByType: Record<string, number>
): void => {
    // Add the total working days row
    worksheet.addRow(["Liczba dni roboczych", totalWorkingDays]);
    const totalWorkingDaysRow = worksheet.rowCount;
    worksheet.getCell(`A${totalWorkingDaysRow}`).font = { bold: true };
    worksheet.getCell(`B${totalWorkingDaysRow}`).font = { bold: true };

    // Keep track of where colored range type rows start
    const coloredRangeStartRow = totalWorkingDaysRow + 1;

    // Add data for each colored range type (sorted alphabetically)
    Object.keys(workingDaysByType).sort().forEach(type => {
        worksheet.addRow([type, workingDaysByType[type]]);
    });

    // Keep track of where colored range type rows end
    const coloredRangeEndRow = worksheet.rowCount;

    // Add the Okres podstawowy row with formula
    worksheet.addRow(["Okres podstawowy", { formula: `B${totalWorkingDaysRow}-SUM(B${coloredRangeStartRow}:B${coloredRangeEndRow})` }]);

    // Style the Okres podstawowy row to stand out
    const lastRowIndex = worksheet.rowCount;
    worksheet.getCell(`A${lastRowIndex}`).font = { bold: true };
    worksheet.getCell(`B${lastRowIndex}`).font = { bold: true };
};

/**
 * Main function to export data to Excel
 */
export const exportToExcel = async (
    coloredRanges: ColoredRange[],
    periods: Array<{ start: string; end: string }>,
    personalInfo: { firstName: string, lastName: string }
): Promise<void> => {
    try {
        const loading = createLoadingOverlay({ message: 'Generowanie Excel...' });
        loading.updateProgress(10);

        const workbook = new ExcelJS.Workbook();

        periods.forEach((period, index) => {
            const periodStart = new Date(formatDateIfNeeded(period.start));
            const periodEnd = new Date(formatDateIfNeeded(period.end));

            const filteredRanges = coloredRanges.filter(range => {
                const [d1, m1, y1] = range.start.split(/[./]/).map(Number);
                const [d2, m2, y2] = range.end.split(/[./]/).map(Number);
                const rangeStart = new Date(y1, m1 - 1, d1);
                const rangeEnd = new Date(y2, m2 - 1, d2);
                return rangeEnd >= periodStart && rangeStart <= periodEnd;
            });

            const totalWorkingDays = calculateWorkingDays(period.start, period.end);
            const { workingDaysByType } = calculateWorkingDaysByType(filteredRanges);

            const worksheet = workbook.addWorksheet(`Rok ${index + 1}`);
            applyWorksheetStyling(worksheet, personalInfo);
            populateWorksheetData(worksheet, totalWorkingDays, workingDaysByType);
        });

        // Ogólne podsumowanie w zakładce „Suma”
        const allWorkingDays = calculateTotalWorkingDays(periods);
        const { workingDaysByType: allTypes } = calculateWorkingDaysByType(coloredRanges);
        const summarySheet = workbook.addWorksheet("Suma");
        applyWorksheetStyling(summarySheet, personalInfo);
        populateWorksheetData(summarySheet, allWorkingDays, allTypes);

        loading.updateProgress(90);

        const fileName = generateFileName(personalInfo);
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        saveAs(blob, fileName);
        loading.updateProgress(100);
        setTimeout(() => loading.close(), 500);

        console.log("Excel exported successfully");
    } catch (error) {
        console.error("Failed to export to Excel:", error);
        removeExistingOverlays();
        alert("Wystąpił błąd podczas eksportu do Excela.");
    }
};
