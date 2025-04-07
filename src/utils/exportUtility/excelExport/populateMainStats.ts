import ExcelJS from "exceljs";
import {PersonalInfo} from "@/types/Period";

interface WorkingDaysByType {
    [type: string]: number;
}

export const generateMainLeftSegment = (
    ws: ExcelJS.Worksheet,
    personalInfo: PersonalInfo,
    totalWorkingDays: number,
    workingDaysByType: WorkingDaysByType
) => {
    // 🔹 Kolumny
    ws.columns = [
        { header: '', key: 'type', width: 25 },
        { header: '', key: 'days', width: 20 },
        { header: '', key: 'extra', width: 20 },
        { header: '', key: 'more', width: 20 }
    ];

    // 🔹 Nagłówek
    ws.getCell('A1').value = `Statystyki dla: ${personalInfo.firstName} ${personalInfo.lastName}`;
    ws.mergeCells('A1:D1');
    ws.getCell('A1').font = { bold: true, size: 14 };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    // 🔹 Nagłówki tabeli
    ws.getCell('A2').value = 'Typ';
    ws.getCell('B2').value = 'Liczba dni (roboczych)';
    ws.getCell('A2').font = { bold: true };
    ws.getCell('B2').font = { bold: true };

    // 🔹 Statystyki ogólne
    ws.addRow(["Liczba dni roboczych", totalWorkingDays]);
    const baseRow = ws.rowCount;
    ws.getCell(`A${baseRow}`).font = { bold: true };
    ws.getCell(`B${baseRow}`).font = { bold: true };

    const coloredStartRow = baseRow + 1;

    // 🔹 Statystyki wg typów
    Object.keys(workingDaysByType).sort().forEach(type => {
        ws.addRow([type, workingDaysByType[type]]);
    });

    const coloredEndRow = ws.rowCount;

    // 🔹 Oblicz okres podstawowy jako różnicę
    ws.addRow([
        "Okres podstawowy",
        { formula: `B${baseRow}-SUM(B${coloredStartRow}:B${coloredEndRow})` }
    ]);

    const lastRow = ws.rowCount;
    ws.getCell(`A${lastRow}`).font = { bold: true };
    ws.getCell(`B${lastRow}`).font = { bold: true };
};