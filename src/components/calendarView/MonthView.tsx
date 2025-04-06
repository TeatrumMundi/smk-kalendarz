import React from "react";
import { MonthViewProps } from "@/types/Period";
import DayCell from "@/components/calendarView/DayCell";
import {getWorkingDaysInRange, isPolishHoliday, isSameDate, parseDateString} from "@/utils/helpers";

const DAYS_LABELS = ["PN", "WT", "ŚR", "CZ", "PT", "SB", "ND"];
const MONTHS = [
    "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
    "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
];

const MonthView: React.FC<MonthViewProps> = ({
                                                 month,
                                                 periodIndex,
                                                 selectedLegendType,
                                                 isDateInBasePeriod,
                                                 handleDayClick,
                                                 rangeSelection,
                                                 coloredRanges
                                             }) => {
    const monthNumber = MONTHS.indexOf(month.name.toLowerCase());

    const workingDaysInMonth = getWorkingDaysInRange(
        new Date(month.year, monthNumber, 1),
        new Date(month.year, monthNumber + 1, 0),
        (date) => isDateInBasePeriod(date, periodIndex)
    );

    return (
        <div className="rounded-xs shadow p-1.5 bg-gray-800 hover:shadow-lg transition-all">
            <h3 className="font-bold mb-2 text-gray-100">
                {month.name} {month.year}
                <span className="ml-2 text-sm font-normal">
          (<span className="text-blue-400">{workingDaysInMonth}</span> dni roboczych)
        </span>
            </h3>

            <div className="grid grid-cols-7 gap-1">
                {DAYS_LABELS.map((day, i) => (
                    <div key={i} className="text-xs font-medium text-gray-400 text-center">
                        {day}
                    </div>
                ))}

                {month.days.map((day, dayIndex) => {
                    if (!day.day) return <div key={dayIndex} />;

                    const currentDate = new Date(month.year, monthNumber, day.day);
                    const isWeekend = dayIndex % 7 >= 5;
                    const isHoliday = isPolishHoliday(currentDate);
                    const isInBasePeriod = isDateInBasePeriod(currentDate, periodIndex);
                    const allRanges = coloredRanges.filter(r =>
                        currentDate >= parseDateString(r.start) &&
                        currentDate <= parseDateString(r.end)
                    );

                    const isSelected = !!rangeSelection.start && isSameDate(currentDate, rangeSelection.start);
                    const rangeStart = allRanges.some(r => isSameDate(currentDate, parseDateString(r.start)));
                    const rangeEnd = allRanges.some(r => isSameDate(currentDate, parseDateString(r.end)));

                    return (
                        <DayCell
                            key={dayIndex}
                            day={day.day}
                            date={currentDate}
                            isWeekend={isWeekend}
                            isHoliday={isHoliday}
                            isInBasePeriod={isInBasePeriod}
                            coloredRanges={allRanges}
                            isSelected={isSelected}
                            selectedLegendType={selectedLegendType}
                            onClick={() => handleDayClick(currentDate, periodIndex)}
                            rangeStart={rangeStart}
                            rangeEnd={rangeEnd}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;
