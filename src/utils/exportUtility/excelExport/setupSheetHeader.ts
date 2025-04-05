import ExcelJS from "exceljs";

export const setupSheetHeader = (ws: ExcelJS.Worksheet, personalInfo: { firstName: string; lastName: string }) => {
    ws.columns = [
        { header: '', key: 'type', width: 25 },
        { header: '', key: 'days', width: 20 },
        { header: '', key: 'extra', width: 20 },
        { header: '', key: 'more', width: 20 }
    ];

    ws.addRow([`Statystyki dla: ${personalInfo.firstName} ${personalInfo.lastName}`]);
    ws.addRow([]);
    ws.mergeCells('A2:D2');

    ws.getCell('A1').font = { bold: true, size: 14 };
    ws.getCell('A2').alignment = { horizontal: 'center' };
    ws.getCell('A2').font = { bold: true, size: 15 };

    ws.addRow(['Typ', 'Liczba dni (roboczych)']);
    ws.getCell('A3').font = { bold: true };
    ws.getCell('B3').font = { bold: true };
};
