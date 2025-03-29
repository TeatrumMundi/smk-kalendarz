import { ColoredRange } from "@/types/Period";
import { isDateInRange } from "@/utils/helpers/dateHelpers";
import { isPolishHoliday } from "@/utils/helpers/polishHolidays";
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
): string | null => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = isPolishHoliday(date);
    if (isWeekend || isHoliday) return selectedLegendType;

    const existingRangeIndex = coloredRanges.findIndex(range => isDateInRange(date, range));

    if (existingRangeIndex !== -1 && !rangeSelection.start) {
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

        const overlappingRanges = coloredRanges.filter(range => {
            const [d1, m1, y1] = range.start.split(/[\/.]/).map(Number);
            const [d2, m2, y2] = range.end.split(/[\/.]/).map(Number);
            const rangeStart = new Date(y1, m1 - 1, d1);
            const rangeEnd = new Date(y2, m2 - 1, d2);
            return finalStart <= rangeEnd && finalEnd >= rangeStart;
        });

        let newRanges = [...coloredRanges];

        overlappingRanges.forEach(range => {
            const index = newRanges.findIndex(r => r === range);
            if (index !== -1) newRanges.splice(index, 1);
        });

        newRanges = [...newRanges, ...overlappingRanges];

        const currentDate = new Date(finalStart);
        let segmentStart: Date | null = null;

        while (currentDate <= finalEnd) {
            const currentDay = new Date(currentDate);
            const isInExistingRange = overlappingRanges.some(range => isDateInRange(currentDay, range));

            if (!isInExistingRange) {
                if (segmentStart === null) {
                    segmentStart = new Date(currentDay);
                }
            } else {
                if (segmentStart !== null) {
                    const segmentEnd = new Date(currentDay);
                    segmentEnd.setDate(segmentEnd.getDate() - 1);

                    if (segmentStart <= segmentEnd) {
                        const shouldAskForLabel = selectedLegendType === "Staże" || selectedLegendType === "Kursy";
                        const label = shouldAskForLabel ? prompt("Nadaj nazwę temu zakresowi (opcjonalnie):")?.trim() : undefined;

                        const newRange: ColoredRange = {
                            start: formatDate(segmentStart),
                            end: formatDate(segmentEnd),
                            type: selectedLegendType,
                            color: selectedLegendColor,
                            ...(label ? { label } : {})
                        };

                        newRanges.push(newRange);
                        console.log("Dodano zakres:", newRange);
                    }

                    segmentStart = null;
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (segmentStart !== null) {
            const shouldAskForLabel = selectedLegendType === "Staże" || selectedLegendType === "Kursy";
            const label = shouldAskForLabel ? prompt("Nadaj nazwę temu zakresowi (opcjonalnie):")?.trim() : undefined;

            const newRange: ColoredRange = {
                start: formatDate(segmentStart),
                end: formatDate(finalEnd),
                type: selectedLegendType,
                color: selectedLegendColor,
                ...(label ? { label } : {})
            };

            newRanges.push(newRange);
            console.log("Dodano zakres:", newRange);
        }

        setColoredRanges(newRanges);
        setRangeSelection({ start: null, end: null });
        return null;
    }
};
