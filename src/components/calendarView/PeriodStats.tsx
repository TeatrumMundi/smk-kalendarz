import { useState, useEffect } from 'react';
import { getWorkingDaysInRange } from '@/utils/helpers/getWorkingDaysInRange';

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
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        console.log("Aktualne coloredRanges:", coloredRanges);
    }, [coloredRanges]);


    const periodStart = periods[parseInt(periodIndex)].start;
    const periodEnd = periods[parseInt(periodIndex)].end;

    const periodStartDate = new Date(periodStart);
    const periodEndDate = new Date(periodEnd);

    const filteredRanges = coloredRanges.filter(range => {
        const separator = range.start.includes('/') ? '/' : '.';
        const [dayStart, monthStart, yearStart] = range.start.split(separator).map(Number);
        const rangeStartDate = new Date(yearStart, monthStart - 1, dayStart);

        const [dayEnd, monthEnd, yearEnd] = range.end.split(separator).map(Number);
        const rangeEndDate = new Date(yearEnd, monthEnd - 1, dayEnd);

        return (rangeStartDate <= periodEndDate && rangeEndDate >= periodStartDate);
    });

    const groupedRanges = filteredRanges.reduce((acc, range) => {
        const key = range.type;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(range);
        return acc;
    }, {} as Record<string, ColoredRange[]>);

    const totalWorkingDays = getWorkingDaysInRange(periodStart, periodEnd);
    const coloredRangeDays = filteredRanges.reduce((sum, range) => {
        const rangeDays = getWorkingDaysInRange(range.start, range.end);
        return sum + rangeDays;
    }, 0);

    const basicPeriodDays = totalWorkingDays - coloredRangeDays;

    const formatStatsForClipboard = (grouped: Record<string, ColoredRange[]>) => {
        const basicLine = `Okres podstawowy ilość dni: ${basicPeriodDays}`;
        const lines = Object.entries(grouped).map(([type, ranges]) => {
            const dateRanges = ranges.map(r => r.start === r.end ? r.start : `${r.start}-${r.end}`).join(', ');
            const days = ranges.reduce((sum, r) => sum + getWorkingDaysInRange(r.start, r.end), 0);
            const label = ranges[0].label ? ` (${ranges[0].label})` : '';
            return `${type}${label}: ${dateRanges} - Łączna ilość dni roboczych: ${days}`;
        });
        return [basicLine, ...lines].join('\n');
    };

    const handleLegendClick = (type: string) => {
        if (selectedType === type) {
            onSelectType(null);
        } else {
            onSelectType(type);
        }
    };

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
                const isSelected = selectedType === type;
                const totalWorkingDays = ranges.reduce((sum, range) =>
                    sum + getWorkingDaysInRange(range.start, range.end), 0
                );

                const dateRangesString = ranges.map(range => {
                    const separator = range.start.includes('/') ? '/' : '.';
                    const [startDay, startMonth, startYear] = range.start.split(separator).map(Number);
                    const [endDay, endMonth, endYear] = range.end.split(separator).map(Number);
                    const startDate = new Date(startYear, startMonth - 1, startDay);
                    const endDate = new Date(endYear, endMonth - 1, endDay);
                    return startDate.getTime() === endDate.getTime()
                        ? range.start
                        : `${range.start}-${range.end}`;
                }).join(', ');

                return (
                    <div
                        key={type}
                        className={`mb-4 p-2 rounded-md cursor-pointer transition-colors duration-200 ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                        onClick={() => handleLegendClick(type)}
                    >
                        <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-4 h-4 ${ranges[0].color} rounded-full shadow-sm`}></div>
                            <span className="text-white font-medium">
                                {type}{ranges[0].label ? ` (${ranges[0].label})` : ''}:
                                <span className="text-gray-300"> {dateRangesString}</span> - Łączna ilość dni roboczych: <span className="text-blue-400">{totalWorkingDays}</span>
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
