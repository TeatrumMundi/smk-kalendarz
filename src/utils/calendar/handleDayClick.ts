import { ColoredRange } from "@/types/Period";
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

interface LegendItem {
    color: string;
    label: string;
    special?: boolean;
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
    }

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

    const selectedLegend = legendItems.find(item => item.label === selectedLegendType);
    const selectedLegendColor = selectedLegend?.color || "";
    const isSpecial = selectedLegend?.special ?? false;
    const shouldAskForLabel = selectedLegendType === "Staże" || selectedLegendType === "Kursy";

    const onConfirm = (label?: string) => {
        const newRanges: ColoredRange[] = [];
        const current = new Date(finalStart);
        let segmentStart: Date | null = null;

        while (current <= finalEnd) {
            const dateCopy = new Date(current);
            const isOverlapping = coloredRanges.some(range => isDateInRange(dateCopy, range));

            if (!isOverlapping || isSpecial) {
                if (!segmentStart) segmentStart = new Date(dateCopy);
            } else if (segmentStart) {
                const segmentEnd = new Date(dateCopy);
                segmentEnd.setDate(segmentEnd.getDate() - 1);

                newRanges.push({
                    start: formatDate(segmentStart),
                    end: formatDate(segmentEnd),
                    type: selectedLegendType,
                    color: selectedLegendColor,
                    special: isSpecial,
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
                special: isSpecial,
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
