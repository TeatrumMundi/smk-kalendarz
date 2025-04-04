﻿import React from "react";
import { ColoredRange } from "@/types/Period";
import clsx from "clsx";
import {calculateRangeIndex} from "@/utils/helpers/calendarLogic";

interface DayCellProps {
    day: number | null;
    date: Date | null;
    isWeekend: boolean;
    isHoliday: boolean;
    isInBasePeriod: boolean;
    coloredRange: ColoredRange | null;
    isSelected: boolean;
    selectedLegendType: string | null;
    onClick: (date: Date) => void;
    rangeStart?: boolean;
    rangeEnd?: boolean;
}

const DayCell: React.FC<DayCellProps> = ({
                                             day,
                                             date,
                                             isWeekend,
                                             isHoliday,
                                             isInBasePeriod,
                                             coloredRange,
                                             isSelected,
                                             selectedLegendType,
                                             onClick,
                                             rangeStart,
                                             rangeEnd,
                                         }) => {
    const isClickable = !!date && isInBasePeriod && !isWeekend && !isHoliday;

    const classes = clsx(
        "h-8 text-md border p-0.5 rounded-xs flex justify-center items-center transition-all",
        isWeekend && "bg-red-900 cursor-not-allowed",
        isHoliday && "bg-orange-900 cursor-not-allowed",
        !isInBasePeriod && "bg-gray-600 cursor-not-allowed",
        coloredRange && !isWeekend && !isHoliday && `${coloredRange.color} cursor-pointer hover:opacity-50`,
        isInBasePeriod && selectedLegendType && !isWeekend && !isHoliday && "cursor-pointer hover:opacity-50",
        isSelected && "bg-gray-600",
        rangeStart && "rounded-l-full",
        rangeEnd && "rounded-r-full"
    );

    const textClass = clsx(
        isWeekend || isHoliday
            ? "text-red-400/30"
            : !isInBasePeriod
                ? "text-gray-700"
                : coloredRange
                    ? "text-white font-semibold drop-shadow"
                    : "text-gray-200"
    );

    const rangeIndex = (date && coloredRange)
        ? calculateRangeIndex(date, coloredRange.start)
        : null;

    return (
        <div
            className={classes}
            onClick={() => (isClickable && date ? onClick(date) : null)}
        >
            {day && (
                <div className="flex flex-col items-center leading-tight">
                    <span className={textClass}>{day}</span>
                    {rangeIndex && !isWeekend && !isHoliday && (
                        <span className="text-[10px] text-white/80 leading-none">#{rangeIndex}</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default DayCell;
