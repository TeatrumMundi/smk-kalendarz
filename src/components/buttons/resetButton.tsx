import React from 'react';
import { Period } from "@/types/Period";
import { ColoredRange } from "@/types/Period";

interface ResetButtonProps {
    setPeriods: React.Dispatch<React.SetStateAction<Period[]>>;
    setDisplayPeriods: React.Dispatch<React.SetStateAction<Array<{ start: string; end: string }>>>;
    setColoredRanges: React.Dispatch<React.SetStateAction<ColoredRange[]>>;
    setPersonalInfo: React.Dispatch<React.SetStateAction<{ firstName: string; lastName: string }>>;
}

const ResetButton: React.FC<ResetButtonProps> = ({
                                                     setPeriods,
                                                     setDisplayPeriods,
                                                     setColoredRanges,
                                                     setPersonalInfo
                                                 }) => {
    const handleReset = () => {
        if (window.confirm('Czy na pewno chcesz zresetować wszystkie dane? Ta akcja jest nieodwracalna.')) {
            setPeriods([{ start: "", end: "" }]);
            setDisplayPeriods([{ start: "", end: "" }]);
            setColoredRanges([]);
            setPersonalInfo({ firstName: "", lastName: "" });
        }
    };

    return (
        <button
            onClick={handleReset}
            className="fixed bottom-4 left-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all"
        >
            Resetuj dane
        </button>
    );
};

export default ResetButton;