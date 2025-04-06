import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { createLoadingOverlay, removeExistingOverlays } from "@/utils/animations/loadingOverlay";
import {ColoredRange, PersonalInfo} from "@/types/Period";
import {SMK_PDF} from "@/components/PDF/SMK_PDF";

export const exportToPDF = async (
    personalInfo: PersonalInfo,
    coloredRanges: ColoredRange[],
    periods: { start: string; end: string }[]
) => {
    try {
        const loading = createLoadingOverlay({ message: 'Generowanie PDF...' });

        const doc = <SMK_PDF coloredRanges={coloredRanges} periods={periods} />;
        const blob = await pdf(doc).toBlob();
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);

        saveAs(blob, `${personalInfo.firstName}_${personalInfo.lastName}_${timestamp}_SMK.pdf`);
        loading.updateProgress(100);
        setTimeout(() => loading.close(), 500);
    } catch (error) {
        console.error('PDF generation error:', error);
        removeExistingOverlays();
        alert('Wystąpił błąd podczas generowania PDF.');
    }
};
