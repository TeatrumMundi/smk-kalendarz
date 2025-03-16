import React from 'react';
import { exportToExcel } from '@/app/utils/exportToExcel';
import { ColoredRange } from '@/app/types/Period';

interface ExportExcelButtonProps {
    personalInfo: { firstName: string, lastName: string };
    coloredRanges: ColoredRange[];
    periods: Array<{ start: string; end: string }>;
}

const ExcelButton: React.FC<ExportExcelButtonProps> = ({ personalInfo, coloredRanges, periods }) => {
    return (
        <button
            onClick={() => exportToExcel(coloredRanges, periods, personalInfo)}
            className="fixed bottom-4 right-36 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all"
        >
            Zapisz Excel
        </button>
    );
};

export default ExcelButton;
