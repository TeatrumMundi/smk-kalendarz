import { useState } from 'react';
import { getWorkingDaysInRange } from '@/app/utils/getWorkingDaysInRange';

interface ColoredRange {
    start: string;
    end: string;
    type: string;
    color: string;
}

interface PeriodStatsProps {
    coloredRanges: ColoredRange[];
    periodIndex: string;
    periods: Array<{ start: string; end: string; }>;
}

export const PeriodStats = ({ coloredRanges, periodIndex, periods }: PeriodStatsProps) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const periodYear = new Date(periods[parseInt(periodIndex)].start).getFullYear();

    const filteredRanges = coloredRanges.filter(range => {
        const separator = range.start.includes('/') ? '/' : '.';
        const [, , year] = range.start.split(separator);
        const rangeYear = parseInt(year);
        return rangeYear === periodYear;
    });

    const groupedRanges = filteredRanges.reduce((acc, range) => {
        if (!acc[range.type]) {
            acc[range.type] = [];
        }
        acc[range.type].push(range);
        return acc;
    }, {} as Record<string, ColoredRange[]>);

    const formatStatsForClipboard = (groupedRanges: Record<string, ColoredRange[]>) => {
        const basicPeriodLine = `Okres podstawowy ilość dni: ${basicPeriodDays}`;
        const rangesStats = Object.entries(groupedRanges)
            .map(([type, ranges]) => {
                const dateRanges = ranges.map(range => `${range.start}-${range.end}`).join(', ');
                const totalWorkingDays = ranges.reduce((sum, range) =>
                    sum + getWorkingDaysInRange(range.start, range.end), 0
                );
                return `${type}: ${dateRanges} - Łączna ilość dni roboczych: ${totalWorkingDays}`;
            })
            .join('\n');

        return `${basicPeriodLine}\n${rangesStats}`;
    };

    const periodStart = periods[parseInt(periodIndex)].start;
    const periodEnd = periods[parseInt(periodIndex)].end;

    const totalWorkingDays = getWorkingDaysInRange(periodStart, periodEnd);
    const coloredRangeDays = filteredRanges.reduce((sum, range) => {
        const rangeDays = getWorkingDaysInRange(range.start, range.end);
        return sum + rangeDays;
    }, 0);

    const basicPeriodDays = totalWorkingDays - coloredRangeDays;

    return (
        <div className="mt-4 p-6 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-white">Statystyki okresów</h4>
                <button
                    onClick={async () => {
                        const statsText = formatStatsForClipboard(groupedRanges);
                        await navigator.clipboard.writeText(statsText);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 3000);
                    }}
                    className={`
                        transition-all duration-300 ease-out
                        ${copySuccess ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'} 
                        text-white px-4 py-2 rounded-lg text-sm font-medium
                    `}
                >
                    {copySuccess ? 'Skopiowano!' : 'Kopiuj statystyki'}
                </button>
            </div>
            <div className="mb-6">
                <span className="text-lg font-semibold text-white">
                    Okres podstawowy ilość dni: <span className="text-blue-400">{basicPeriodDays}</span>
                </span>
            </div>
            {Object.entries(groupedRanges).map(([type, ranges]) => {
                const totalWorkingDays = ranges.reduce((sum, range) =>
                    sum + getWorkingDaysInRange(range.start, range.end), 0
                );
                const dateRangesString = ranges.map(range => `${range.start}-${range.end}`).join(', ');

                return (
                    <div key={type} className="mb-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-4 h-4 ${ranges[0].color} rounded-full shadow-sm`}></div>
                            <span className="text-white font-medium">
                                {type}: <span className="text-gray-300">{dateRangesString}</span> - Łączna ilość dni roboczych: <span className="text-blue-400">{totalWorkingDays}</span>
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};