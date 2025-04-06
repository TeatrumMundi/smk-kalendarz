import React from 'react';
import { exportToPDF } from "@/utils/exportUtility/exportToPDF";
import {ColoredRange} from "@/types/Period";

interface ExportPDFButtonProps {
    personalInfo: {
        firstName: string;
        lastName: string;
    };
    coloredRanges: ColoredRange[];
    periods: Array<{ start: string; end: string }>;
}
const PDFButton: React.FC<ExportPDFButtonProps> = ({ personalInfo, coloredRanges, periods }) => {
    return (
        <button
            onClick={() => exportToPDF(personalInfo, coloredRanges, periods)}
            className="
        fixed bottom-4 right-4
        bg-gradient-to-r from-rose-500 to-red-600
        hover:from-rose-600 hover:to-red-700
        text-white font-bold py-2 px-4
        rounded-xs shadow-lg transition-all duration-300 ease-out
      "
        >
            Zapisz PDF
        </button>
    );
};

export default PDFButton;