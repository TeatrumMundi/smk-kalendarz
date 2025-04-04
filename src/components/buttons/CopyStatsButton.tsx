'use client';

import { useState } from "react";

interface CopyStatsButtonProps {
    getStatsTextAction: () => string;
}

export const CopyStatsButton = ({ getStatsTextAction }: CopyStatsButtonProps) => {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = async () => {
        const text = getStatsTextAction();
        await navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`
        w-[150px] transition-all duration-300 ease-out
        text-white px-4 py-2 rounded-xs text-sm font-medium
        bg-gradient-to-r
        ${copySuccess
                ? 'from-green-500 to-green-700'
                : 'from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'}
    `}
        >
            {copySuccess ? 'Skopiowano!' : 'Kopiuj statystyki'}
        </button>
    );
};
