﻿import { ColoredRange } from "@/types/Period";
import { isDateInRange } from "@/utils/helpers/dateHelpers";
import { isPolishHoliday } from "@/utils/helpers/polishHolidays";
import React from "react";

/**
 * Represents the current selection range for coloring calendar days.
 */
type RangeSelection = {
    start: Date | null;
    end: Date | null;
};

/**
 * Type definition for setting modal data required for prompting the user
 * with a name input for the colored range.
 */
interface ModalDataSetter {
    (data: {
        start: Date;
        end: Date;
        type: string;
        color: string;
        onConfirm: (label?: string) => void;
        onCancel: () => void;
    } | null): void;
}

/**
 * Handles the logic for when a user clicks on a calendar day.
 *
 * Depending on the current state, it either:
 * - starts a new range selection
 * - finalizes the range selection and adds one or multiple colored ranges
 * - removes an existing range if clicked on one
 * - optionally prompts for a label if the type requires it (e.g. "Staże")
 *
 * @param date - The clicked calendar date
 * @param coloredRanges - List of existing colored ranges
 * @param setColoredRanges - Setter for updating colored ranges
 * @param selectedLegendType - The currently selected legend type (e.g. "Kursy")
 * @param rangeSelection - The current range selection (start, end)
 * @param setRangeSelection - Setter for updating the selection
 * @param legendItems - List of legend types with associated colors
 * @param isDateInBasePeriod - Function to verify if a date falls in the base period
 * @param periodIndex - Index of the period being interacted with
 * @param setModalData - Setter to open the name input modal when needed
 * @returns A string representing the legend type if it should be preserved, or null
 */
export const handleDayClick = (
    date: Date,
    coloredRanges: ColoredRange[],
    setColoredRanges: React.Dispatch<React.SetStateAction<ColoredRange[]>>,
    selectedLegendType: string | null,
    rangeSelection: RangeSelection,
    setRangeSelection: React.Dispatch<React.SetStateAction<RangeSelection>>,
    legendItems: Array<{ color: string; label: string }>,
    isDateInBasePeriod: (date: Date, periodIndex: string) => boolean,
    periodIndex: string,
    setModalData: ModalDataSetter
): string | null => {
    // Ignore weekends and holidays
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = isPolishHoliday(date);
    if (isWeekend || isHoliday) return selectedLegendType;

    // Remove existing colored range if clicked on it and not selecting
    const existingRangeIndex = coloredRanges.findIndex(range => isDateInRange(date, range));
    if (existingRangeIndex !== -1 && !rangeSelection.start) {
        const newRanges = [...coloredRanges];
        newRanges.splice(existingRangeIndex, 1);
        setColoredRanges(newRanges);
        return selectedLegendType;
    }

    // Abort if no legend type selected
    if (!selectedLegendType) return null;

    // Start new range selection
    if (!rangeSelection.start) {
        setRangeSelection({ start: date, end: null });
        return selectedLegendType;
    }

    // Determine final range boundaries
    const start = rangeSelection.start;
    const end = date;
    const [finalStart, finalEnd] = start <= end ? [start, end] : [end, start];

    // Prevent cross-period selections
    const isStartInBase = isDateInBasePeriod(finalStart, periodIndex);
    const isEndInBase = isDateInBasePeriod(finalEnd, periodIndex);
    if (isStartInBase !== isEndInBase) {
        alert("Nie można zaznaczyć zakresu, który przekracza granicę okresów podstawowych.");
        setRangeSelection({ start: null, end: null });
        return null;
    }

    const formatDate = (d: Date) =>
        d.toLocaleDateString("pl", { day: "2-digit", month: "2-digit", year: "numeric" });
    const selectedLegendColor = legendItems.find(item => item.label === selectedLegendType)?.color || "";
    const shouldAskForLabel = selectedLegendType === "Staże" || selectedLegendType === "Kursy";

    /**
     * Splits the selected date range into segments that do not overlap existing ranges
     * and adds each segment as a new ColoredRange.
     */
    const onConfirm = (label?: string) => {
        const newRanges: ColoredRange[] = [];
        const current = new Date(finalStart);
        let segmentStart: Date | null = null;

        while (current <= finalEnd) {
            const dateCopy = new Date(current);
            const isOverlapping = coloredRanges.some(range => isDateInRange(dateCopy, range));

            if (!isOverlapping) {
                if (!segmentStart) segmentStart = new Date(dateCopy);
            } else if (segmentStart) {
                const segmentEnd = new Date(dateCopy);
                segmentEnd.setDate(segmentEnd.getDate() - 1);

                newRanges.push({
                    start: formatDate(segmentStart),
                    end: formatDate(segmentEnd),
                    type: selectedLegendType,
                    color: selectedLegendColor,
                    ...(label ? { label } : {})
                });

                segmentStart = null;
            }

            current.setDate(current.getDate() + 1);
        }

        // Close any remaining open range
        if (segmentStart) {
            newRanges.push({
                start: formatDate(segmentStart),
                end: formatDate(finalEnd),
                type: selectedLegendType,
                color: selectedLegendColor,
                ...(label ? { label } : {})
            });
        }

        if (newRanges.length > 0) {
            setColoredRanges(prev => [...prev, ...newRanges]);
        }

        setRangeSelection({ start: null, end: null });
    };

    // Modal with label if needed
    if (shouldAskForLabel) {
        setModalData({
            start: finalStart,
            end: finalEnd,
            type: selectedLegendType,
            color: selectedLegendColor,
            onConfirm: (label) => {
                onConfirm(label);
                setRangeSelection({ start: null, end: null });
                setModalData(null);
            },
            onCancel: () => {
                setRangeSelection({ start: null, end: null });
                setModalData(null);
            }
        });
        return null;
    }

    onConfirm();
    return null;
};