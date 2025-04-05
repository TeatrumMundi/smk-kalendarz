import { useEffect } from 'react';
import { getWorkingDaysInRange } from '@/utils/helpers/getWorkingDaysInRange';
import { CopyStatsButton } from "@/components/buttons/CopyStatsButton";
import { ChevronsRight } from "lucide-react";
import {formatStatsForClipboard, groupAndSummarizeRanges} from "@/utils/helpers/calendarLogic";

interface ColoredRange {
    start: string;
    end: string;
    type: string;
    color: string;
    label?: string;
}

interface PeriodStatsProps {
    coloredRanges: ColoredRange[];
    periodIndex: string;
    periods: Array<{ start: string; end: string; }>;
    selectedType?: string | null;
    onSelectType: (type: string | null) => void;
}

export const PeriodStats = ({
                                coloredRanges,
                                periodIndex,
                                periods,
                                selectedType,
                                onSelectType
                            }: PeriodStatsProps) => {

    useEffect(() => {
        console.log("Aktualne coloredRanges:", coloredRanges);
    }, [coloredRanges]);

    const period = periods[parseInt(periodIndex)];
    const { grouped, totalWorkingDays, coloredRangeDays, basicPeriodDays } =
        groupAndSummarizeRanges(coloredRanges, period.start, period.end);

    console.log("grouped", grouped);
    console.log("coloredRanges", coloredRanges);

    const handleLegendClick = (type: string) => {
        if (selectedType === type) {
            onSelectType(null);
        } else {
            onSelectType(type);
        }
    };

    return (
        <div className="mt-4 p-3 bg-gray-800 rounded-xs shadow-lg">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h4 className="text-xl font-bold text-white">Statystyki okresów</h4>
                <h4 className="text-xl font-bold text-white">
                    <span className="text-lg font-semibold text-white ">
                        Okres podstawowy:&nbsp;
                        <span className="text-blue-400">{totalWorkingDays}</span> -
                        <span className="text-red-400"> {coloredRangeDays}</span> =
                        <span className="text-green-400"> {basicPeriodDays}</span>
                    </span>
                </h4>
                <CopyStatsButton
                    getStatsTextAction={() => formatStatsForClipboard(grouped, totalWorkingDays, coloredRangeDays)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(grouped).map(([type, ranges]) => {
                    const isSelected = selectedType === type;
                    const typeWorkingDays = ranges.reduce((sum, range) =>
                        sum + getWorkingDaysInRange(range.start, range.end), 0
                    );

                    return (
                        <div
                            key={type}
                            className={`p-2 rounded-xs cursor-pointer transition-colors duration-200 border border-blue-900 ${isSelected ? 'bg-indigo-600' : 'hover:bg-indigo-600/70'}`}
                            onClick={() => handleLegendClick(type)}
                        >
                            <div className="flex items-start space-x-3">
                                <div className={`w-4 h-4 mt-1 ${ranges[0].color} rounded-xs shadow-sm`}></div>
                                <div className="text-white font-medium text-left">
                                    {type} ( <span className="text-red-400 font-bold">{typeWorkingDays}</span> dni roboczych ):
                                    <ul className="ml-2 mt-1 text-sm text-gray-300 list-none pl-1 text-left space-y-0.5">
                                        {ranges.map((range, i) => {
                                            const rangeText = range.start === range.end
                                                ? range.start
                                                : `${range.start} - ${range.end}`;
                                            const days = getWorkingDaysInRange(range.start, range.end);
                                            return (
                                                <li key={i} className="flex items-start gap-1">
                                                    <ChevronsRight size={14} className="text-green-400 mt-0.5 shrink-0" />
                                                    <span>
                                                        {range.label ? `(${range.label}) ` : ''}
                                                        {rangeText} – {days} dni roboczych
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
