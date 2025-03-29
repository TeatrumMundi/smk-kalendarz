import { useState } from 'react';
import { getWorkingDaysInRange } from '@/utils/helpers/getWorkingDaysInRange';
import {ColoredRange} from "@/types/Period";

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

    // Get the start and end dates of the current period
    const periodStart = periods[parseInt(periodIndex)].start;
    const periodEnd = periods[parseInt(periodIndex)].end;

    // Parse period dates for comparison
    const periodStartDate = new Date(periodStart);
    const periodEndDate = new Date(periodEnd);

    // Filter ranges that fall within the period's date range
    const filteredRanges = coloredRanges.filter(range => {
        // Parse the range start date
        const separator = range.start.includes('/') ? '/' : '.';
        const [dayStart, monthStart, yearStart] = range.start.split(separator).map(Number);
        const rangeStartDate = new Date(yearStart, monthStart - 1, dayStart);

        // Parse the range end date
        const [dayEnd, monthEnd, yearEnd] = range.end.split(separator).map(Number);
        const rangeEndDate = new Date(yearEnd, monthEnd - 1, dayEnd);

        // Check if the range overlaps with the period
        return (rangeStartDate <= periodEndDate && rangeEndDate >= periodStartDate);
    });

    const groupedRanges = filteredRanges.reduce((acc, range) => {
        const key = range.label ? `${range.label} (${range.type})` : range.type;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(range);
        return acc;
    }, {} as Record<string, ColoredRange[]>);

    const formatStatsForClipboard = (groupedRanges: Record<string, ColoredRange[]>) => {
        const basicPeriodLine = `Okres podstawowy ilość dni: ${basicPeriodDays}`;
        const rangesStats = Object.entries(groupedRanges)
            .map(([type, ranges]) => {
                const dateRanges = ranges.map(range => {
                    const startDate = new Date(range.start);
                    const endDate = new Date(range.end);
                    if (startDate.toDateString() === endDate.toDateString()) {
                        return `${range.start}`;
                    }
                    return `${range.start}-${range.end}`;
                }).join(', ');
                const totalWorkingDays = ranges.reduce((sum, range) =>
                    sum + getWorkingDaysInRange(range.start, range.end), 0
                );
                return `${type}: ${dateRanges} - Łączna ilość dni roboczych: ${totalWorkingDays}`;
            })
            .join('\n');

        return `${basicPeriodLine}\n${rangesStats}`;
    };

    const totalWorkingDays = getWorkingDaysInRange(periodStart, periodEnd);
    const coloredRangeDays = filteredRanges.reduce((sum, range) => {
        const rangeDays = getWorkingDaysInRange(range.start, range.end);
        return sum + rangeDays;
    }, 0);

    const basicPeriodDays = totalWorkingDays - coloredRangeDays;

    const handleLegendClick = (type: string) => {
        if (selectedType === type) {
            // If the same type is clicked again, deselect it
            onSelectType(null);
        } else {
            // Otherwise, select the new type
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
            {Object.entries(groupedRanges).map(([labelWithType, ranges]) => {
                const totalWorkingDays = ranges.reduce((sum, range) =>
                    sum + getWorkingDaysInRange(range.start, range.end), 0
                );
                const dateRangesString = ranges.map(range => {
                    // Parse the dates correctly using the separator
                    const separator = range.start.includes('/') ? '/' : '.';
                    const [startDay, startMonth, startYear] = range.start.split(separator).map(Number);
                    const [endDay, endMonth, endYear] = range.end.split(separator).map(Number);
                    
                    const startDate = new Date(startYear, startMonth - 1, startDay);
                    const endDate = new Date(endYear, endMonth - 1, endDay);
                    
                    // Compare dates using getTime() for accurate comparison
                    if (startDate.getTime() === endDate.getTime()) {
                        return range.start;
                    }
                    return `${range.start}-${range.end}`;
                }).join(', ');
                const type = ranges[0].type; // ← wyciągamy oryginalny typ z zakresu
                const isSelected = selectedType === type;

                return (
                    <div
                        key={type}
                        className={`mb-4 p-2 rounded-md cursor-pointer transition-colors duration-200 ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                        onClick={() => handleLegendClick(type)}
                    >
                        <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-4 h-4 ${ranges[0].color} rounded-full shadow-sm`}></div>
                            <span className="text-white font-medium">
                                {labelWithType}: <span className="text-gray-300">{dateRangesString}</span> - Łączna ilość dni roboczych: <span className="text-blue-400">{totalWorkingDays}</span>
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};