import React, {FC, useEffect, useRef} from "react";
import { Period } from "@/types/Period";
import { CalendarPlus2, CalendarMinus2 } from 'lucide-react';

// Props for the main PeriodInput element
interface PeriodInputProps {
    periods: Period[];
    displayPeriods: Array<{ start: string; end: string }>;
    handleDateChange: (index: number, field: "start" | "end", value: string) => void;
    handleDeletePeriod: (index: number) => void;
    addNewPeriod: () => void;
}

// --- Reusable subcomponent representing a single-period input row ---
interface PeriodRowProps {
    index: number;
    start: string;
    end: string;
    onChange: (field: "start" | "end", value: string) => void;
    onDelete: () => void;
    isDeletable: boolean;
}

interface PeriodRowProps {
    index: number;
    start: string;
    end: string;
    onChange: (field: "start" | "end", value: string) => void;
    onDelete: () => void;
    isDeletable: boolean;
}

const PeriodRow: FC<PeriodRowProps> = ({ start, end, onChange, onDelete, isDeletable }) => {
    const endInputRef = useRef<HTMLInputElement>(null);
    const prevStartLengthRef = useRef<number>(start.length);

    // Automatically move focus to "end" once "start" reaches full length (10)
    useEffect(() => {
        const prevLength = prevStartLengthRef.current;
        const currentLength = start.length;

        // Trigger only when going from 9 -> 10 (not backspace or paste)
        if (currentLength === 10 && prevLength < 10) {
            endInputRef.current?.focus();
        }

        prevStartLengthRef.current = currentLength;
    }, [start]);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:space-x-1 p-2 rounded-xs bg-gray-700/50 hover:bg-gray-600 transition-all">
            <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={start}
                onChange={(e) => onChange("start", e.target.value)}
                className="px-3 py-2 rounded-xs border bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            />

            <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={end}
                onChange={(e) => onChange("end", e.target.value)}
                ref={endInputRef}
                className="px-3 py-2 rounded-xs border bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            />

            <button
                onClick={onDelete}
                disabled={Boolean(!isDeletable)}
                className={`text-white rounded-xs w-8 h-8 flex items-center justify-center text-xs font-bold ml-1 transition-all
                ${!isDeletable ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
            >
                <CalendarMinus2 />
            </button>
        </div>
    );
};



// --- Reusable subcomponent for the "+" button to add a new period ---
interface AddPeriodButtonProps {
    onClick: () => void;
}

const AddPeriodButton: FC<AddPeriodButtonProps> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xs w-8 h-8 flex items-center justify-center font-bold transition-all text"
    >
        <CalendarPlus2 />
    </button>
);

// --- Main element that renders the list of period inputs ---
const PeriodInput: FC<PeriodInputProps> = ({
                                               periods,
                                               displayPeriods,
                                               handleDateChange,
                                               handleDeletePeriod,
                                               addNewPeriod,
                                           }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 p-4 w-full">
            <div className="flex flex-row flex-wrap items-center gap-4">
                {/* Render a row for each period */}
                {periods.map((_period, index) => (
                    <div className="flex items-center space-x-1" key={index}>
                        <PeriodRow
                            index={index}
                            start={displayPeriods[index].start}
                            end={displayPeriods[index].end}
                            onChange={(field, value) => handleDateChange(index, field, value)}
                            onDelete={() => handleDeletePeriod(index)}
                            isDeletable={periods.length > 1}
                        />
                        {index === periods.length - 1 && (
                            <div className="ml-1">
                                <AddPeriodButton onClick={addNewPeriod} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PeriodInput;
