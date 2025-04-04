import { getWorkingDaysInMonth } from "@/utils/helpers/getWorkingDays";
import { calculateDays } from "@/utils/helpers/calculateDays";
import { isPolishHoliday } from "@/utils/helpers/polishHolidays";
import { PDFButton, ExcelButton, ResetButton } from "@/components/buttons";
import { PeriodStats } from "@/components/calendarView";
import React from "react";
import {ColoredRange, Period} from "@/types/Period";
import {LegendSelector} from "@/components/calendarView/LegendSelector";

interface CalendarDay {
    day: number | null;
    periods: number[];
}

interface CalendarMonth {
    name: string;
    year: number;
    days: CalendarDay[];
}

export interface PersonalInfo {
    firstName: string;
    lastName: string;
}

interface CalendarRendererProps {
    periodGroups: Record<string, CalendarMonth[]>;
    periods: Period[];
    selectedLegendType: string | null;
    setSelectedLegendType: React.Dispatch<React.SetStateAction<string | null>>;
    isDateInColoredRange: (date: Date, month: number, year: number) => ColoredRange | null;
    isDateInBasePeriod: (date: Date, periodIndex: string) => boolean;
    handleDayClick: (date: Date) => void;
    rangeSelection: { start: Date | null };
    coloredRanges: ColoredRange[];
    personalInfo: PersonalInfo;
    setPeriods: React.Dispatch<React.SetStateAction<Period[]>>;
    setDisplayPeriods: React.Dispatch<React.SetStateAction<Period[]>>;
    setColoredRanges: React.Dispatch<React.SetStateAction<ColoredRange[]>>;
    setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
}

const getMonthNumber = (monthName: string): number => {
    const months = [
        'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
        'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
    ];
    return months.indexOf(monthName.toLowerCase());
};

export function CalendarRenderer({
                                     periodGroups,
                                     periods,
                                     selectedLegendType,
                                     setSelectedLegendType,
                                     isDateInColoredRange,
                                     isDateInBasePeriod,
                                     handleDayClick,
                                     rangeSelection,
                                     coloredRanges,
                                     personalInfo,
                                     setPeriods,
                                     setDisplayPeriods,
                                     setColoredRanges,
                                     setPersonalInfo
                                 }: CalendarRendererProps) {
    return (
        <div id="calendar-container" className="mt-6">
            {Object.entries(periodGroups).map(([periodIndex, months]) => (
                <div key={periodIndex} className="mb-8">
                    <h2 className="text-xl font-bold mb-2 border-b pb-2 text-gray-100">
                        Rok {parseInt(periodIndex) + 1}
                        {periods[parseInt(periodIndex)].start && periods[parseInt(periodIndex)].end && (
                            <span className="ml-2 text-gray-400">
                                Ilość dni: {calculateDays(periods[parseInt(periodIndex)].start, periods[parseInt(periodIndex)].end)}
                            </span>
                        )}
                    </h2>

                    <LegendSelector
                        selectedLegendType={selectedLegendType}
                        setSelectedLegendTypeAction={setSelectedLegendType}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                        {months.map((month, monthIndex) => (
                            <div key={monthIndex} className="rounded-xs shadow p-1.5 bg-gray-800 hover:shadow-lg transition-all">
                                <h3 className="font-bold mb-2 text-gray-100">
                                    {month.name} {month.year}: {getWorkingDaysInMonth(month.year, getMonthNumber(month.name))} dni pracujących
                                </h3>
                                <div className="grid grid-cols-7 gap-1">
                                    {['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB', 'ND'].map((day : string, i : number) => (
                                        <div key={i} className="text-xs font-medium text-gray-400 text-center">{day}</div>
                                    ))}
                                    {month.days.map((day, dayIndex) => {
                                        const currentDate = day.day ? new Date(month.year, getMonthNumber(month.name), day.day) : null;
                                        const isWeekend : boolean = dayIndex % 7 >= 5;
                                        const isHoliday : boolean = currentDate ? isPolishHoliday(currentDate) : false;
                                        const coloredRange = currentDate ? isDateInColoredRange(currentDate, getMonthNumber(month.name), month.year) : null;
                                        const isInBasePeriod : boolean = currentDate ? isDateInBasePeriod(currentDate, periodIndex) : false;

                                        return (
                                            <div
                                                key={dayIndex}
                                                className={`h-8 text-md border p-0.5 rounded-xs flex justify-center items-center
                                                    ${isWeekend ? 'bg-red-900 cursor-not-allowed' : ''}
                                                    ${isHoliday ? 'bg-orange-900 cursor-not-allowed' : ''}
                                                    ${!isInBasePeriod ? 'bg-gray-600 cursor-not-allowed' : ''}
                                                    ${coloredRange ? `${coloredRange.color} ${!(isWeekend || isHoliday) ? 'cursor-pointer hover:opacity-50' : ''}` : ''}
                                                    ${isInBasePeriod && selectedLegendType && !(isWeekend || isHoliday) ? 'cursor-pointer hover:opacity-50' : ''}
                                                    ${rangeSelection.start && currentDate?.getTime() === rangeSelection.start.getTime() ? 'bg-gray-600' : ''}
                                                    transition-all`}
                                                onClick={() => currentDate && isInBasePeriod && !(isWeekend || isHoliday) && handleDayClick(currentDate)}
                                            >
                                                {day.day && (
                                                    <div className={`${(isWeekend || isHoliday) ? 'text-red-400' : !isInBasePeriod ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {day.day}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <PeriodStats
                        coloredRanges={coloredRanges}
                        periodIndex={periodIndex}
                        periods={periods}
                        selectedType={selectedLegendType}
                        onSelectType={setSelectedLegendType}
                    />

                    <PDFButton personalInfo={personalInfo} />
                    <ExcelButton
                        personalInfo={personalInfo}
                        coloredRanges={coloredRanges}
                        periods={periods}
                    />
                    <ResetButton
                        setPeriods={setPeriods}
                        setDisplayPeriods={setDisplayPeriods}
                        setColoredRanges={setColoredRanges}
                        setPersonalInfo={setPersonalInfo}
                    />
                </div>
            ))}
        </div>
    );
}
