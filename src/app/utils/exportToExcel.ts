import * as XLSX from 'xlsx';
import {ColoredRange} from "@/app/types/Period";
import {getWorkingDaysInRange} from "@/app/utils/getWorkingDaysInRange";

type WorksheetData = Array<Array<string | number>>;

export const exportToExcel = (
    coloredRanges: ColoredRange[],
    _periods: Array<{ start: string; end: string }>, // Prefix with underscore to indicate it's not used
    personalInfo: { firstName: string, lastName: string }
) => {
    try {
        // Group colored ranges by type
        const workingDaysByType: Record<string, number> = {};

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
        });

        // Prepare data for Excel
        const worksheetData: WorksheetData = [];

        // Add header with personal info
        worksheetData.push([`Statystyki dla: ${personalInfo.firstName} ${personalInfo.lastName}`]);
        worksheetData.push([]);  // Empty row

        // Add data for each type
        worksheetData.push(['Typ', 'Liczba dni (roboczych)']);
        Object.keys(workingDaysByType).forEach(type => {
            worksheetData.push([type, workingDaysByType[type]]);
        });

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths (A and B columns to 160 pixels)
        worksheet['!cols'] = [
            {wch: 20},  // A column width (approximately 160 pixels)
            {wch: 20}   // B column width (approximately 160 pixels)
        ];

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Statystyki');

        // Generate Excel file
        const fileName = `statystyki_${personalInfo.firstName}_${personalInfo.lastName}.xlsx`;
        XLSX.writeFile(workbook, fileName);

    } catch (error) {
        console.error('Failed to export to Excel:', error);
        alert('Wystąpił błąd podczas eksportu do Excela.');
    }
};
