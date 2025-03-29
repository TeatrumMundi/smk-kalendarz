"use client"

import { useMemo } from "react";
import { isPolishHoliday } from "@/utils/helpers/polishHolidays";
import { getWorkingDaysInMonth } from "@/utils/helpers/getWorkingDays";
import { generateCalendarData } from "@/utils/calendar/generateCalendarData";
import ErrorPopup from "@/components/errors/ErrorPopup";
import { PeriodStats } from '@/components/calendarView/PeriodStats';
import { calculateDays } from "@/utils/helpers/calculateDays";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { handleDayClick as handleDayClickUtil } from "@/utils/calendar/handleDayClick";
import ResetButton from "@/components/buttons/resetButton";
import PDFButton from "@/components/buttons/PDFButton";
import PersonalInfoForm from "@/components/calendarView/personalInfoForm";
import PeriodInput from "@/components/calendarView/PeriodInput";
import { useColoredRanges } from '@/hooks/useColoredRanges';
import { usePeriods } from '@/hooks/usePeriods';
import { usePersonalInfo } from '@/hooks/usePersonalInfo';
import ExcelButton from "@/components/buttons/excelButton";
import { legendItems } from '@/config/legendConfig';

const getMonthNumber = (monthName: string): number => {
  const months = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];
  return months.indexOf(monthName.toLowerCase());
};

export default function Home() {
  // Create a wrapper function that matches the expected signature
  const handlePeriodDelete = (index: number) => {
    handleDeletePeriod(index, coloredRanges, setColoredRanges);
  };

  const {
    coloredRanges,
    setColoredRanges,
    selectedLegendType,
    setSelectedLegendType,
    rangeSelection,
    setRangeSelection,
    isDateInColoredRange
  } = useColoredRanges();

  const {
    periods,
    setPeriods,
    displayPeriods,
    setDisplayPeriods,
    validationResult,
    showPopup,
    validPeriods,
    addNewPeriod,
    handleDeletePeriod,
    handleDateChange
  } = usePeriods();

  const {
    personalInfo,
    setPersonalInfo,
    handlePersonalInfoChange
  } = usePersonalInfo();

  const parseDate = (dateString: string): Date | null => {
    if (!dateString || dateString.trim() === '') return null;

    // Check if the date is in YYYY-MM-DD format
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(part => parseInt(part, 10));
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      return new Date(year, month - 1, day);
    }
    // Check if the date is in DD/MM/YYYY format
    else if (dateString.includes('/') || dateString.includes('.')) {
      const parts = dateString.split(/[\/.]/).map(part => parseInt(part, 10));
      if (parts.length !== 3 || parts.some(isNaN)) return null;
      const [day, month, year] = parts;
      return new Date(year, month - 1, day);
    }

    return null; // Unrecognized format
  };

  const isDateInBasePeriod = (date: Date, periodIndexStr: string): boolean => {
    const periodIndex = parseInt(periodIndexStr);

    if (periodIndex < 0 || periodIndex >= periods.length) {
      return false;
    }

    const period = periods[periodIndex];
    if (!period || !period.start || !period.end) {
      return false;
    }

    const startDate = parseDate(period.start);
    const endDate = parseDate(period.end);

    if (!startDate || !endDate) {
      return false;
    }

    // Set hours to 0 for all dates to compare just the dates
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return compareDate >= startDate && compareDate <= endDate;
  };

  const handleDayClick = (date: Date) => {
    const newSelectedType = handleDayClickUtil(
        date,
        coloredRanges,
        setColoredRanges,
        selectedLegendType,
        rangeSelection,
        setRangeSelection,
        legendItems
    );

    // If the utility function returns null, don't change the selected type
    if (newSelectedType === null) return;

    // Otherwise set it to the returned value (which could be null to reset it)
    setSelectedLegendType(newSelectedType);
  };

  const groupMonthsByPeriod = (months: Array<{ name: string, year: number, days: Array<{ day: number | null, periods: number[] }> }>) => {
    const periodGroups: { [key: number]: Array<{ name: string, year: number, days: Array<{ day: number | null, periods: number[] }> }> } = {};
    months.forEach(month => {
      month.days.forEach(day => {
        day.periods.forEach(periodIndex => {
          if (!periodGroups[periodIndex]) periodGroups[periodIndex] = [];
          if (!periodGroups[periodIndex].includes(month)) periodGroups[periodIndex].push(month);
        });
      });
    });
    return periodGroups;
  };

  const memoizedCalendarData = useMemo(() => generateCalendarData(validPeriods), [validPeriods]);
  const periodGroups = useMemo(() => {
    if (!memoizedCalendarData.hasData) return {};
    const groups = groupMonthsByPeriod(memoizedCalendarData.months);
    return Object.fromEntries(Object.entries(groups).filter(([key]) => parseInt(key) < periods.length));
  }, [memoizedCalendarData, periods.length]);

  return (
      <div className="max-w-full mx-auto p-4 text-center relative bg-gray-900 min-h-screen text-gray-100">
        <h1 className="text-2xl font-bold mb-6">Wprowadź dane</h1>
        <PersonalInfoForm
            personalInfo={personalInfo}
            handlePersonalInfoChange={handlePersonalInfoChange}
        />
        <h1 className="text-2xl font-bold mb-6">Wprowadź okresy</h1>
        <PeriodInput
            periods={periods}
            displayPeriods={displayPeriods}
            handleDateChange={handleDateChange}
            handleDeletePeriod={handlePeriodDelete}
            addNewPeriod={addNewPeriod}
        />

        {memoizedCalendarData.hasData ? (
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
                      {legendItems.map((item: {color:string, label:string}, index: number) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {months.map((month, monthIndex) => (
                          <div key={monthIndex} className="border rounded-lg shadow p-4 bg-gray-800 hover:shadow-lg transition-all">
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

                                // Only check if we have a valid date
                                const isInBasePeriod = currentDate ? isDateInBasePeriod(currentDate, periodIndex) : false;

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`h-8 text-xs border p-0.5 rounded-lg flex justify-center items-center
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
              <SpeedInsights />
              <Analytics />
            </div>
        ) : (
            <div className="mt-6 text-gray-400">
              Wprowadź kompletne okresy, aby zobaczyć kalendarz
            </div>
        )}
        <ErrorPopup show={showPopup && !validationResult.isValid} message={validationResult.errorMessage} />
      </div>
  );
}