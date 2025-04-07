import {ColoredRange, LegendItem} from "@/types/Period";
import { isDateInRange } from "@/utils/helpers/dateHelpers";
import { isPolishHoliday } from "@/utils/helpers/polishHolidays";
import { getCalendarDaysInRange } from "@/utils/helpers/getCalendarDaysInRange";
import { getWorkingDaysInRange } from "@/utils/helpers/getWorkingDaysInRange";
import React from "react";

type RangeSelection = {
    start: Date | null;
    end: Date | null;
};

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
export const handleDayClick = (
    date: Date,
    coloredRanges: ColoredRange[],
    setColoredRanges: React.Dispatch<React.SetStateAction<ColoredRange[]>>,
    selectedLegendType: string | null,
    rangeSelection: RangeSelection,
    setRangeSelection: React.Dispatch<React.SetStateAction<RangeSelection>>,
    legendItems: LegendItem[],
    isDateInBasePeriod: (date: Date, periodIndex: string) => boolean,
    periodIndex: string,
    setModalData: ModalDataSetter
): string | null => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = isPolishHoliday(date);
    const selectedLegend = legendItems.find(item => item.label === selectedLegendType);
    const isSpecial = selectedLegend?.special ?? false;

    if ((isWeekend || isHoliday) && !isSpecial) return selectedLegendType;

    if (!selectedLegendType) return null;

    const selectedLegendColor = selectedLegend?.color || "";
    const shouldAskForLabel = selectedLegendType === "Staże" || selectedLegendType === "Kursy";
    const formattedDate = date.toLocaleDateString("pl", { day: "2-digit", month: "2-digit", year: "numeric" });

    // 🔴 Handle special one-day ranges (e.g., Dyżur)
    if (isSpecial) {
        const exists = coloredRanges.some(
            r => r.start === formattedDate && r.end === formattedDate && r.type === selectedLegendType && r.special
        );

        if (exists) {
            // If already exists, remove it
            setColoredRanges(prev =>
                prev.filter(r => !(r.start === formattedDate && r.end === formattedDate && r.type === selectedLegendType && r.special))
            );
        } else {
            // Else add a new one-day range
            const newRange: ColoredRange = {
                start: formattedDate,
                end: formattedDate,
                type: selectedLegendType,
                color: selectedLegendColor,
                special: true,
                totalDays: 1,
                workingDays: isWeekend || isHoliday ? 0 : 1,
            };
            setColoredRanges(prev => [...prev, newRange]);
        }

        return selectedLegendType;
    }

    // 🧹 Handle clicking on an existing range
    const existingRangeIndex = coloredRanges.findIndex(r => isDateInRange(date, r));
    const existingRange = existingRangeIndex !== -1 ? coloredRanges[existingRangeIndex] : null;

    if (existingRange && !rangeSelection.start) {
        if (existingRange.special) {
            // Special range can only be removed if matching type is selected
            const isSameType = existingRange.type === selectedLegendType;
            if (isSameType) {
                const updated = [...coloredRanges];
                updated.splice(existingRangeIndex, 1);
                setColoredRanges(updated);
            }
            return selectedLegendType;
        }

        // For normal ranges — always allow deletion
        const updated = [...coloredRanges];
        updated.splice(existingRangeIndex, 1);
        setColoredRanges(updated);
        return selectedLegendType;
    }

    // 🟢 Start selection
    if (!rangeSelection.start) {
        setRangeSelection({ start: date, end: null });
        return selectedLegendType;
    }

    // 🔵 Complete selection
    const start = rangeSelection.start;
    const end = date;
    const [finalStart, finalEnd] = start <= end ? [start, end] : [end, start];

    const isStartInBase = isDateInBasePeriod(finalStart, periodIndex);
    const isEndInBase = isDateInBasePeriod(finalEnd, periodIndex);

    if (isStartInBase !== isEndInBase) {
        alert("Nie można zaznaczyć zakresu, który przekracza granicę okresów podstawowych.");
        setRangeSelection({ start: null, end: null });
        return null;
    }

    const formatDate = (d: Date) =>
        d.toLocaleDateString("pl", { day: "2-digit", month: "2-digit", year: "numeric" });

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
                    special: false,
                    totalDays: getCalendarDaysInRange(segmentStart, segmentEnd),
                    workingDays: getWorkingDaysInRange(segmentStart, segmentEnd),
                    ...(label ? { label } : {})
                });

                segmentStart = null;
            }

            current.setDate(current.getDate() + 1);
        }

        if (segmentStart) {
            newRanges.push({
                start: formatDate(segmentStart),
                end: formatDate(finalEnd),
                type: selectedLegendType,
                color: selectedLegendColor,
                special: false,
                totalDays: getCalendarDaysInRange(segmentStart, finalEnd),
                workingDays: getWorkingDaysInRange(segmentStart, finalEnd),
                ...(label ? { label } : {})
            });
        }

        if (newRanges.length > 0) {
            setColoredRanges(prev => [...prev, ...newRanges]);
        }

        setRangeSelection({ start: null, end: null });
    };

    if (shouldAskForLabel) {
        setModalData({
            start: finalStart,
            end: finalEnd,
            type: selectedLegendType,
            color: selectedLegendColor,
            onConfirm: (label) => {
                onConfirm(label);
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