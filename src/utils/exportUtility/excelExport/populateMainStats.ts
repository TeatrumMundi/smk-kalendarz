import ExcelJS from "exceljs";

/**
 * Populates worksheet with summary stats for working days.
 * Ensures all legend types are displayed, even if the count is 0.
 *
 * @param ws - Excel worksheet
 * @param totalWorkingDays - Total working days in the base period
 * @param workingDaysByType - Map of a legend type → working day count
 * @param allTypes - Full list of possible legend types (to include 0-values)
 */
export const populateMainStats = (
    ws: ExcelJS.Worksheet,
    totalWorkingDays: number,
    workingDaysByType: Record<string, number>,
    allTypes: string[] // <--- NEW
) => {
    ws.addRow(["Liczba dni roboczych", totalWorkingDays]);
    const baseRow = ws.rowCount;
    ws.getCell(`A${baseRow}`).font = { bold: true };
    ws.getCell(`B${baseRow}`).font = { bold: true };

    const coloredStartRow = baseRow + 1;

    // 💡 Use allTypes instead of only keys from workingDaysByType
    allTypes.sort().forEach(type => {
        const value = workingDaysByType[type] ?? 0;
        ws.addRow([type, value]);
    });

    const coloredEndRow = ws.rowCount;

    ws.addRow([
        "Okres podstawowy",
        { formula: `B${baseRow}-SUM(B${coloredStartRow}:B${coloredEndRow})` }
    ]);

    const lastRow = ws.rowCount;
    ws.getCell(`A${lastRow}`).font = { bold: true };
    ws.getCell(`B${lastRow}`).font = { bold: true };
};
