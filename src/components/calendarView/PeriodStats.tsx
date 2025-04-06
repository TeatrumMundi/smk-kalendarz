import { CopyStatsButton } from "@/components/buttons/CopyStatsButton";
import { ChevronsRight } from "lucide-react";
import {
    formatStatsForClipboard,
    groupAndSummarizeRanges
} from "@/utils/helpers/calendarLogic";
import { PeriodStatsProps } from "@/types/Period";

export const PeriodStats = ({ coloredRanges, periodIndex, periods }: PeriodStatsProps) => {
    const period = periods[parseInt(periodIndex)];

    const normalRanges = coloredRanges.filter(r => !r.special);
    const specialRanges = coloredRanges.filter(r => r.special);

    const {
        grouped: normalGrouped,
        totalWorkingDays,
        coloredRangeDays,
        basicPeriodDays
    } = groupAndSummarizeRanges(normalRanges, period.start, period.end);

    const grouped = {
        ...normalGrouped,
        ...specialRanges.reduce((acc, range) => {
            if (!acc[range.type]) acc[range.type] = [];
            acc[range.type].push(range);
            return acc;
        }, {} as typeof normalGrouped)
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
                    getStatsTextAction={() =>
                        formatStatsForClipboard(normalGrouped, totalWorkingDays, coloredRangeDays)
                    }
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(grouped).map(([type, ranges]) => {
                    const isSpecial = ranges[0].special;

                    const typeWorkingDays = isSpecial
                        ? 0
                        : ranges.reduce((sum, range) => sum + (range.workingDays ?? 0), 0);

                    return (
                        <div key={type} className="p-2 rounded-xs border border-blue-900">
                            <div className="flex items-start space-x-3">
                                <div className={`w-4 h-4 mt-1 ${ranges[0].color} rounded-xs shadow-sm`}></div>
                                <div className="text-white font-medium text-left">
                                    {type}
                                    {!isSpecial && (
                                        <span className="ml-1 text-red-400 font-bold">
                                            ({typeWorkingDays} dni roboczych)
                                        </span>
                                    )}
                                    <ul className="ml-2 mt-1 text-sm text-gray-300 list-none pl-1 text-left space-y-0.5">
                                        {ranges.map((range, i) => {
                                            const rangeText =
                                                range.start === range.end
                                                    ? range.start
                                                    : `${range.start} - ${range.end}`;
                                            const days = range.workingDays;

                                            return (
                                                <li key={i} className="flex items-start gap-1">
                                                    <ChevronsRight
                                                        size={14}
                                                        className="text-green-400 mt-0.5 shrink-0"
                                                    />
                                                    <span>
                                                        {range.label ? `(${range.label}) ` : ""}
                                                        {rangeText}
                                                        {!isSpecial && ` – ${days} dni roboczych`}
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
