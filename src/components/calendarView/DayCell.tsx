import React from "react";
import { ColoredRange } from "@/types/Period";
import clsx from "clsx";
import { calculateRangeIndex } from "@/utils/helpers/calendarLogic";
import { isDateInRange } from "@/utils/helpers";

interface DayCellProps {
    day: number | null;
    date: Date | null;
    isWeekend: boolean;
    isHoliday: boolean;
    isInBasePeriod: boolean;
    coloredRanges: ColoredRange[];
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
                                             coloredRanges,
                                             isSelected,
                                             selectedLegendType,
                                             onClick,
                                             rangeStart,
                                             rangeEnd,
                                         }) => {
    const isClickable = !!date && isInBasePeriod && !isWeekend && !isHoliday;

    // 🟦 Główna warstwa (np. Urlop, Staż)
    const mainRange = coloredRanges.find(r => !r.special);

    // 🟥 Warstwa specjalna (np. Dyżur)
    const specialRange = coloredRanges.find(r => r.special);

    // 🔍 Czy istnieje jakikolwiek nakładający się zakres typu "special"?
    const hasAnySpecial = coloredRanges.some(r =>
        date && isDateInRange(date, r) && r.special
    );

    // 🎨 Styl koloru tła (z głównego zakresu)
    const baseColor = mainRange?.color ?? "";

    const classes = clsx(
        "h-8 text-md border p-0.5 rounded-xs flex justify-center items-center transition-all",
        isWeekend && "bg-red-900 cursor-not-allowed",
        isHoliday && "bg-orange-900 cursor-not-allowed",
        !isInBasePeriod && "bg-gray-600 cursor-not-allowed",

        // Kolor głównego zakresu
        baseColor && !isWeekend && !isHoliday && `${baseColor} cursor-pointer hover:opacity-50`,

        // Efekt przy wybranej legendzie
        isInBasePeriod && selectedLegendType && !isWeekend && !isHoliday && "cursor-pointer hover:opacity-50",

        isSelected && "bg-gray-600",
        rangeStart && "rounded-l-full",
        rangeEnd && "rounded-r-full",

        // Pierścień dla specjalnych zakresów
        specialRange && "ring-2 ring-indigo-500"
    );

    // 🔤 Kolor tekstu z priorytetem dla special
    const textClass = clsx(
        isWeekend || isHoliday
            ? "text-red-400/30"
            : !isInBasePeriod
                ? "text-gray-700"
                : hasAnySpecial
                    ? "text-red-500 font-semibold"
                    : "text-white font-semibold"
    );

    // 🔢 Index w ramach głównego zakresu
    const rangeIndex = date && mainRange
        ? calculateRangeIndex(date, mainRange.start)
        : null;

    return (
        <div
            className={classes}
            onClick={() => isClickable && date && onClick(date)}
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
