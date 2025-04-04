import { getWorkingDaysInMonth } from "@/utils/helpers/getWorkingDays";
import { calculateDays } from "@/utils/helpers/calculateDays";
import { isPolishHoliday } from "@/utils/helpers/polishHolidays";
import { legendItems } from '@/config/legendConfig';
import { PDFButton, ExcelButton, ResetButton } from "@/components/buttons";
import { PeriodStats } from "@/components/calendarView";
import React from "react";
import {ColoredRange, Period} from "@/types/Period";

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
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-100">
                        Rok {parseInt(periodIndex) + 1}
                        {periods[parseInt(periodIndex)].start && periods[parseInt(periodIndex)].end && (
                            <span className="ml-2 text-gray-400">
                Ilość dni: {calculateDays(periods[parseInt(periodIndex)].start, periods[parseInt(periodIndex)].end)}
              </span>
                        )}
                    </h2>

                    <div className="mt-4 flex flex-nowrap space-x-2 p-4 bg-gray-800 rounded-lg overflow-x-auto justify-center">
                        {legendItems.map((item, index) => (
                            <div
                                key={index}
                                className={`flex items-center whitespace-nowrap cursor-pointer p-2 rounded transition-all
                  ${selectedLegendType === item.label ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                                onClick={() => setSelectedLegendType(selectedLegendType === item.label ? null : item.label)}
                            >
                                <div className={`w-3 h-3 ${item.color} rounded mr-2`}></div>
                                <span className="text-xs text-gray-100">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                        {months.map((month, monthIndex) => (
                            <div key={monthIndex} className="border rounded-xs shadow p-2 bg-gray-800 hover:shadow-lg transition-all">
                                <h3 className="font-bold mb-2 text-gray-100">
                                    {month.name} {month.year}: {getWorkingDaysInMonth(month.year, getMonthNumber(month.name))} dni pracujących
                                </h3>
                                <div className="grid grid-cols-7 gap-1">
                                    {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day, i) => (
                                        <div key={i} className="text-xs font-medium text-gray-400 text-center">{day}</div>
                                    ))}
                                    {month.days.map((day, dayIndex) => {
                                        const currentDate = day.day ? new Date(month.year, getMonthNumber(month.name), day.day) : null;
                                        const isWeekend = dayIndex % 7 >= 5;
                                        const isHoliday = currentDate ? isPolishHoliday(currentDate) : false;
                                        const coloredRange = currentDate ? isDateInColoredRange(currentDate, getMonthNumber(month.name), month.year) : null;
                                        const isInBasePeriod = currentDate ? isDateInBasePeriod(currentDate, periodIndex) : false;

                                        return (
                                            <div
                                                key={dayIndex}
                                                className={`h-8 text-md border p-0.5 rounded-xs flex justify-center items-center
                          ${isWeekend ? 'bg-red-900' : ''}
                          ${isHoliday ? 'bg-orange-900' : ''}
                          ${coloredRange ? `${coloredRange.color} ${!(isWeekend || isHoliday) ? 'cursor-pointer hover:opacity-50' : ''}` : ''}
                          ${!isInBasePeriod ? 'bg-gray-600' : ''}
                          ${isInBasePeriod && selectedLegendType && !(isWeekend || isHoliday) ? 'hover:opacity-50 cursor-pointer' : ''}
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
