import React from 'react';
import { exportToExcel } from '@/utils/exportUtility/excelExport/exportToExcel';
import { ColoredRange } from '@/types/Period';

interface ExportExcelButtonProps {
    personalInfo: { firstName: string, lastName: string };
    coloredRanges: ColoredRange[];
    periods: Array<{ start: string; end: string }>;
}

const ExcelButton: React.FC<ExportExcelButtonProps> = ({ personalInfo, coloredRanges, periods }) => {
    return (
        <button
            onClick={() => exportToExcel(coloredRanges, periods, personalInfo)}
            className="
        fixed bottom-4 right-36
        bg-gradient-to-r from-emerald-500 to-green-600
        hover:from-emerald-600 hover:to-green-700
        text-white font-bold py-2 px-4
        rounded-xs shadow-lg transition-all duration-300 ease-out
    "
        >
            Zapisz Excel
        </button>
    );
};

export default ExcelButton;
