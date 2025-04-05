import React from "react";
import { CalendarMonth } from "./CalendarRenderer";
import { isPolishHoliday } from "@/utils/helpers/polishHolidays";
import { ColoredRange } from "@/types/Period";
import DayCell from "@/components/calendarView/DayCell";

interface MonthViewProps {
    month: CalendarMonth;
    periodIndex: string;
    selectedLegendType: string | null;
    isDateInColoredRange: (date: Date, month: number, year: number) => ColoredRange | null;
    isDateInBasePeriod: (date: Date, periodIndex: string) => boolean;
    handleDayClick: (date: Date) => void;
    rangeSelection: { start: Date | null };
}

const parseDateString = (str: string): Date => {
    const [d, m, y] = str.split(/[./]/).map(Number);
    return new Date(y, m - 1, d);
};

const isSameDate = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

const MonthView: React.FC<MonthViewProps> = ({
                                                 month,
                                                 periodIndex,
                                                 selectedLegendType,
                                                 isDateInColoredRange,
                                                 isDateInBasePeriod,
                                                 handleDayClick,
                                                 rangeSelection
                                             }) => {
    const monthNumber = [
        "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
        "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
    ].indexOf(month.name.toLowerCase());

    return (
        <div className="rounded-xs shadow p-1.5 bg-gray-800 hover:shadow-lg transition-all">
            <h3 className="font-bold mb-2 text-gray-100">
                {month.name} {month.year}
            </h3>
            <div className="grid grid-cols-7 gap-1">
                {["PN", "WT", "ŚR", "CZ", "PT", "SB", "ND"].map((day, i) => (
                    <div key={i} className="text-xs font-medium text-gray-400 text-center">
                        {day}
                    </div>
                ))}
                {month.days.map((day, dayIndex) => {
                    const currentDate = day.day
                        ? new Date(month.year, monthNumber, day.day)
                        : null;
                    const isWeekend = dayIndex % 7 >= 5;
                    const isHoliday = currentDate ? isPolishHoliday(currentDate) : false;
                    const coloredRange = currentDate
                        ? isDateInColoredRange(currentDate, monthNumber, month.year)
                        : null;
                    const isInBasePeriod = currentDate
                        ? isDateInBasePeriod(currentDate, periodIndex)
                        : false;
                    const isSelected =
                        rangeSelection.start &&
                        currentDate?.getTime() === rangeSelection.start.getTime();

                    const rangeStart = coloredRange && currentDate && isSameDate(currentDate, parseDateString(coloredRange.start));
                    const rangeEnd = coloredRange && currentDate && isSameDate(currentDate, parseDateString(coloredRange.end));

                    return (
                        <DayCell
                            key={dayIndex}
                            day={day.day}
                            date={currentDate}
                            isWeekend={isWeekend}
                            isHoliday={isHoliday}
                            isInBasePeriod={isInBasePeriod}
                            coloredRange={coloredRange}
                            isSelected={!!isSelected}
                            selectedLegendType={selectedLegendType}
                            onClick={handleDayClick}
                            rangeStart={!!rangeStart}
                            rangeEnd={!!rangeEnd}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;
