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

    // Check if the date is in any existing range
    const existingRangeIndex = coloredRanges.findIndex(range => isDateInRange(date, range));

    // If clicking on an existing range with no range selection in progress, delete it
    if (existingRangeIndex !== -1 && !rangeSelection.start) {
        // If we're not in the middle of creating a new range, delete the existing one
        const newRanges = [...coloredRanges];
        newRanges.splice(existingRangeIndex, 1);
        setColoredRanges(newRanges);
        return selectedLegendType;
    }

    // If no legend type selected, return null
    if (!selectedLegendType) return null;

    // Starting a new range selection
    if (!rangeSelection.start) {
        setRangeSelection({ start: date, end: null });
        return selectedLegendType;
    } else {
        // Completing a range selection
        const start = rangeSelection.start;
        const end = date;
        const [finalStart, finalEnd] = start <= end ? [start, end] : [end, start];
        const formatDate = (d: Date) => d.toLocaleDateString('pl', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const selectedLegendColor = legendItems.find(item => item.label === selectedLegendType)?.color || '';

        // Find all ranges that overlap with our new range
        const overlappingRanges = coloredRanges.filter(range => {
            const rangeParts = range.start.split(/[\/.]/);
            const rangeEndParts = range.end.split(/[\/.]/);

            const rangeStart = new Date(
                parseInt(rangeParts[2]),
                parseInt(rangeParts[1]) - 1,
                parseInt(rangeParts[0])
            );

            const rangeEnd = new Date(
                parseInt(rangeEndParts[2]),
                parseInt(rangeEndParts[1]) - 1,
                parseInt(rangeEndParts[0])
            );

            // Check if ranges overlap
            return (finalStart <= rangeEnd && finalEnd >= rangeStart);
        });

        if (overlappingRanges.length === 0) {
            const label = prompt("Nadaj nazwę temu zakresowi (opcjonalnie):")?.trim();
            const newRange: ColoredRange = {
                start: formatDate(finalStart),
                end: formatDate(finalEnd),
                type: selectedLegendType,
                color: selectedLegendColor,
                label: label || undefined
            };

            setColoredRanges([...coloredRanges, newRange]);
        } else {
            // We have overlapping ranges
            let newRanges = [...coloredRanges];

            // Remove all overlapping ranges from our working copy
            overlappingRanges.forEach(range => {
                const index = newRanges.findIndex(r => r === range);
                if (index !== -1) {
                    newRanges.splice(index, 1);
                }
            });

            // Add back all overlapping ranges
            newRanges = [...newRanges, ...overlappingRanges];

            // Now add our new non-overlapping segments
            const currentDate = new Date(finalStart);
            let segmentStart: Date | null = null;

            // Go through each day in our range
            while (currentDate <= finalEnd) {
                const currentDay = new Date(currentDate);

                // Check if this day is in any of the overlapping ranges
                const isInExistingRange = overlappingRanges.some(range => {
                    return isDateInRange(currentDay, range);
                });

                if (!isInExistingRange) {
                    // This day is not in any existing range
                    if (segmentStart === null) {
                        // Start a new segment
                        segmentStart = new Date(currentDay);
                    }
                } else {
                    // This day is in an existing range
                    if (segmentStart !== null) {
                        // End the current segment
                        const segmentEnd = new Date(currentDay);
                        segmentEnd.setDate(segmentEnd.getDate() - 1);

                        if (segmentStart <= segmentEnd) {
                            // Add this segment
                            newRanges.push({
                                start: formatDate(segmentStart),
                                end: formatDate(segmentEnd),
                                type: selectedLegendType,
                                color: selectedLegendColor
                            });
                        }

                        segmentStart = null;
                    }
                }

                // Move to the next day
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // If we have an open segment at the end, close it
            if (segmentStart !== null) {
                newRanges.push({
                    start: formatDate(segmentStart),
                    end: formatDate(finalEnd),
                    type: selectedLegendType,
                    color: selectedLegendColor
                });
            }

            setColoredRanges(newRanges);
        }

        // Reset the range selection
        setRangeSelection({ start: null, end: null });
        return null;
    }
};
