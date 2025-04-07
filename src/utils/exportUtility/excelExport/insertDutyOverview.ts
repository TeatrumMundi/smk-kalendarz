import ExcelJS from "exceljs";
import { ColoredRange, Period } from "@/types/Period";
import { parseDateString } from "@/utils/helpers/dateHelpers";

export const insertDutyOverview = (
    ws: ExcelJS.Worksheet,
    duties: ColoredRange[],
    periods: Period[]
) => {
    if (duties.length === 0) return;

    ws.getCell('G1').value = 'Dyżury';
    ws.getCell('F1').value = 'Rok';
    ws.getCell('G1').font = ws.getCell('F1').font = { bold: true };

    let row = 2;

    duties.forEach(duty => {
        const dutyDate = parseDateString(duty.start);
        let label = 'Poza zakresem';

        for (let i = 0; i < periods.length; i++) {
            const periodStart = parseDateString(periods[i].start);
            const periodEnd = parseDateString(periods[i].end);

            if (dutyDate >= periodStart && dutyDate <= periodEnd) {
                label = `Rok ${i + 1}`;
                break;
            }
        }

        ws.getCell(`G${row}`).value = duty.start;
        ws.getCell(`F${row}`).value = label;
        row++;
    });

    ws.getColumn('G').width = 15;
    ws.getColumn('F').width = 10;
};
