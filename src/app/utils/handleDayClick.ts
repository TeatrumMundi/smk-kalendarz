import { ColoredRange } from "@/app/types/Period";
import { isDateInRange } from "@/app/utils/dateHelpers";
import { isPolishHoliday } from "@/app/utils/polishHolidays";
import React from "react";

type RangeSelection = {
    start: Date | null;
    end: Date | null;
};

export const handleDayClick = (
    date: Date,
    coloredRanges: ColoredRange[],
    setColoredRanges: React.Dispatch<React.SetStateAction<ColoredRange[]>>,
    selectedLegendType: string | null,
    rangeSelection: RangeSelection,
    setRangeSelection: React.Dispatch<React.SetStateAction<RangeSelection>>,
    legendItems: Array<{ color: string; label: string }>
): string | null =>{
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = isPolishHoliday(date);
    if (isWeekend || isHoliday) return selectedLegendType;

    const existingRangeIndex = coloredRanges.findIndex(range => isDateInRange(date, range));
    if (existingRangeIndex !== -1) {
        const newRanges = [...coloredRanges];
        newRanges.splice(existingRangeIndex, 1);
        setColoredRanges(newRanges);
        return selectedLegendType;
    }

    if (!selectedLegendType) return null;

    if (!rangeSelection.start) {
        setRangeSelection({ start: date, end: null });
        return selectedLegendType;
    } else {
        const start = rangeSelection.start;
        const end = date;
        const [finalStart, finalEnd] = start <= end ? [start, end] : [end, start];

        const formatDate = (d: Date) => d.toLocaleDateString('pl', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const selectedLegendColor = legendItems.find(item => item.label === selectedLegendType)?.color || '';
        const newRange: ColoredRange = {
            start: formatDate(finalStart),
            end: formatDate(finalEnd),
            type: selectedLegendType,
            color: selectedLegendColor
        };

        setColoredRanges([...coloredRanges, newRange]);
        setRangeSelection({ start: null, end: null });
        return null;  // Reset the selected legend type
    }
};
