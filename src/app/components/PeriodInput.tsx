import { FC } from 'react';
import { Period } from "@/app/types/Period";

interface PeriodInputProps {
    periods: Period[];
    displayPeriods: Array<{ start: string, end: string }>;
    handleDateChange: (index: number, field: "start" | "end", value: string) => void;
    handleDeletePeriod: (index: number) => void;
    addNewPeriod: () => void;
}

const PeriodInput: FC<PeriodInputProps> = ({
                                               periods,
                                               displayPeriods,
                                               handleDateChange,
                                               handleDeletePeriod,
                                               addNewPeriod
                                           }) => {
    return (
        <div className="flex flex-wrap items-center gap-4 p-4 w-full bg-gray-800 rounded-lg shadow-md">
            <div className="flex flex-row flex-wrap items-center gap-4">
                {periods.map((_period, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all">
                        <label className="font-medium text-sm">Rok {index + 1}:</label>
                        <input
                            type="text"
                            placeholder="DD/MM/RRRR"
                            value={displayPeriods[index].start}
                            onChange={(e) => handleDateChange(index, "start", e.target.value)}
                            className="px-3 py-2 rounded-lg border bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="text"
                            placeholder="DD/MM/RRRR"
                            value={displayPeriods[index].end}
                            onChange={(e) => handleDateChange(index, "end", e.target.value)}
                            className="px-3 py-2 rounded-lg border bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                        />
                        <button
                            onClick={() => handleDeletePeriod(index)}
                            disabled={periods.length === 1}
                            className={`text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-2 transition-all
                ${periods.length === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={addNewPeriod}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-all"
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default PeriodInput;
