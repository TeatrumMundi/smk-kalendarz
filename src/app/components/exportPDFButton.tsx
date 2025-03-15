import React from 'react';
import { exportToPDF } from "@/app/utils/exportToPDF";

interface ExportPDFButtonProps {
    personalInfo: {
        firstName: string;
        lastName: string;
    };
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ personalInfo }) => {
    return (
        <button
            onClick={() => exportToPDF(personalInfo)}
            className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all"
        >
            Zapisz PDF
        </button>
    );
};

export default ExportPDFButton;