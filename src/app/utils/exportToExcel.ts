import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ColoredRange } from "@/app/types/Period";
import { getWorkingDaysInRange } from "@/app/utils/getWorkingDaysInRange";
import { createLoadingOverlay, removeExistingOverlays } from "@/app/utils/loadingOverlay";

// Function to apply styling to the worksheet
const applyWorksheetStyling =
    (worksheet: ExcelJS.Worksheet, personalInfo: { firstName: string, lastName: string }) => {
        // Set column widths
        worksheet.columns = [
            { header: '', key: 'type', width: 20 },
            { header: '', key: 'days', width: 20 }
        ];

        // Add header with personal info
        worksheet.addRow([`Statystyki dla: ${personalInfo.firstName} ${personalInfo.lastName}`]);
        worksheet.addRow([]); // Empty row

        // Merge cells A2 and B2 for the empty row
        worksheet.mergeCells('A2:B2');

        // Center the merged cell
        worksheet.getCell('A2').alignment = { horizontal: 'center' };
        worksheet.getCell('A2').font = { bold: true, size: 15 };

        // Add data for each type
        worksheet.addRow(['Typ', 'Liczba dni (roboczych)']);

        // Apply some styling
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A3').font = { bold: true };
        worksheet.getCell('B3').font = { bold: true };
    };

export const exportToExcel = async (
    coloredRanges: ColoredRange[],
    periods: Array<{ start: string; end: string }>,
    personalInfo: { firstName: string, lastName: string }
) => {
    try {
        // Create loading overlay
        const loading = createLoadingOverlay({
            message: 'Generowanie Excel...'
        });
        loading.updateProgress(10); // Initial progress

        // Group colored ranges by type
        const workingDaysByType: Record<string, number> = {};

        loading.updateProgress(20);

        // Calculate working days for basic periods (now called "Liczba dni roboczych")
        let totalWorkingDays = 0;
        periods.forEach(period => {
            // Format dates to DD/MM/YYYY if they're not already in that format
            const formatDateIfNeeded = (dateStr: string) => {
                // Check if date is in ISO format (YYYY-MM-DD)
                if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = dateStr.split('-');
                    return `${day}/${month}/${year}`;
                }
                return dateStr;
            };

            const startFormatted = formatDateIfNeeded(period.start);
            const endFormatted = formatDateIfNeeded(period.end);

            // Calculate working days for this basic period
            const workingDays = getWorkingDaysInRange(startFormatted, endFormatted);
            totalWorkingDays += workingDays;
        });

        // Add "Liczba dni roboczych" to the workingdaysbytype
        workingDaysByType["Liczba dni roboczych"] = totalWorkingDays;

        // Process colored ranges and track their total
        let totalColoredRangeDays = 0;

        coloredRanges.forEach(range => {
            if (!workingDaysByType[range.type]) {
                workingDaysByType[range.type] = 0;
            }

            // Format dates to DD/MM/YYYY if they're not already in that format
            const formatDateIfNeeded = (dateStr: string) => {
                // Check if date is in ISO format (YYYY-MM-DD)
                if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = dateStr.split('-');
                    return `${day}/${month}/${year}`;
                }
                return dateStr;
            };

            const startFormatted = formatDateIfNeeded(range.start);
            const endFormatted = formatDateIfNeeded(range.end);

            // Calculate working days using the getWorkingDaysInRange function
            const workingDays = getWorkingDaysInRange(startFormatted, endFormatted);
            workingDaysByType[range.type] += workingDays;
            totalColoredRangeDays += workingDays;
        });

        loading.updateProgress(40);

        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Suma');

        loading.updateProgress(50);

        // Apply styling to the worksheet
        applyWorksheetStyling(worksheet, personalInfo);

        // Add data for each type, ensuring "Liczba dni roboczych" is first
        const orderedTypes = ["Liczba dni roboczych", ...Object.keys(workingDaysByType).filter(type => type !== "Liczba dni roboczych")];

        orderedTypes.forEach(type => {
            if (workingDaysByType[type] !== undefined) {
                worksheet.addRow([type, workingDaysByType[type]]);
            }
        });

        // Add the remaining days (total working days - sum of colored ranges)
        const remainingDays = totalWorkingDays - totalColoredRangeDays;
        worksheet.addRow(["Pozostałe dni", remainingDays]);

        // Style the remaining days row to stand out
        const lastRowIndex = worksheet.rowCount;
        worksheet.getCell(`A${lastRowIndex}`).font = { bold: true };
        worksheet.getCell(`B${lastRowIndex}`).font = { bold: true };

        loading.updateProgress(70);

        // Generate Excel file with timestamp
        const sanitizedFirstName = (personalInfo.firstName || 'user').replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedLastName = (personalInfo.lastName || 'report').replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const fileName = `${sanitizedFirstName}_${sanitizedLastName}_SMK_${timestamp}.xlsx`;

        loading.updateProgress(80);

        // Write to buffer
        const buffer = await workbook.xlsx.writeBuffer();

        loading.updateProgress(95);

        // Use file-saver to save the file
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, fileName);

        // Clean up and finish
        loading.updateProgress(100);
        setTimeout(() => {
            loading.close();
        }, 500);

        console.log('Excel exported successfully');

    } catch (error) {
        console.error('Failed to export to Excel:', error);
        removeExistingOverlays();
        alert('Wystąpił błąd podczas eksportu do Excela.');
    }
};
