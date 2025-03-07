"use client"

import { useEffect, useState, useMemo } from "react";
import { ValidationResult } from "@/app/utils/validatePeriods";
import { isPolishHoliday } from "@/app/utils/polishHolidays";
import { ColoredRange, Period } from "@/app/types/Period";
import { getWorkingDaysInMonth } from "@/app/utils/getWorkingDays";
import { handleDisplayChange } from "@/app/utils/handleDisplayChange";
import { generateCalendarData } from "@/app/utils/generateCalendarData";
import { isDateInRange } from "@/app/utils/dateHelpers";
import ErrorPopup from "@/app/components/ErrorPopup";
import { PeriodStats } from '@/app/components/PeriodStats';
import { exportToPDF } from "@/app/utils/exportToPDF";
import { calculateDays } from "@/app/utils/calculateDays";
import { deletePeriod } from "@/app/utils/deletePeriod";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"


// Modern color palette for legend
const legendItems = [
  { color: 'bg-red-500', label: 'Urlop' },
  { color: 'bg-blue-500', label: 'Staże' },
  { color: 'bg-cyan-400', label: 'Kursy' },
  { color: 'bg-emerald-400', label: 'Samokształcenie' },
  { color: 'bg-amber-700', label: 'L4' },
  { color: 'bg-purple-500', label: 'Opieka nad dzieckiem' },
  { color: 'bg-yellow-500', label: 'Kwarantanna' },
  { color: 'bg-pink-400', label: 'Urlop macierzyński' },
  { color: 'bg-green-600', label: 'Urlop wychowawczy' }
];

const getMonthNumber = (monthName: string): number => {
  const months = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];
  return months.indexOf(monthName.toLowerCase());
};

export default function Home() {
  const [periods, setPeriods] = useState<Period[]>([{ start: "", end: "" }]);
  const [selectedLegendType, setSelectedLegendType] = useState<string | null>(null);
  const [coloredRanges, setColoredRanges] = useState<ColoredRange[]>([]);
  const [rangeSelection, setRangeSelection] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [displayPeriods, setDisplayPeriods] = useState<Array<{ start: string, end: string }>>([{ start: "", end: "" }]);
  const [personalInfo, setPersonalInfo] = useState({ firstName: "", lastName: "" });
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errorMessage: "" });
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [validPeriods, setValidPeriods] = useState<Period[]>([]);

  const addNewPeriod = () => {
    setPeriods([...periods, { start: "", end: "" }]);
    setDisplayPeriods([...displayPeriods, { start: "", end: "" }]);
  };

  const handleDeletePeriod = (indexToDelete: number) => {
    deletePeriod(indexToDelete, periods, setPeriods, displayPeriods, setDisplayPeriods, coloredRanges, setColoredRanges);
  };

  const isDateInColoredRange = (date: Date, month: number, year: number) => {
    if (date.getMonth() !== month || date.getFullYear() !== year) return null;
    const matchingRanges = coloredRanges.filter(range => isDateInRange(date, range));
    return matchingRanges.length > 0 ? matchingRanges[matchingRanges.length - 1] : null;
  };

  const handleDayClick = (date: Date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = isPolishHoliday(date);
    if (isWeekend || isHoliday) return;

    const existingRangeIndex = coloredRanges.findIndex(range => isDateInRange(date, range));
    if (existingRangeIndex !== -1) {
      const newRanges = [...coloredRanges];
      newRanges.splice(existingRangeIndex, 1);
      setColoredRanges(newRanges);
      return;
    }

    if (!selectedLegendType) return;

    if (!rangeSelection.start) {
      setRangeSelection({ start: date, end: null });
    } else {
      const start = rangeSelection.start;
      const end = date;
      const [finalStart, finalEnd] = start <= end ? [start, end] : [end, start];

      const formatDate = (d: Date) => d.toLocaleDateString('pl', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const selectedLegendColor = legendItems.find(item => item.label === selectedLegendType)?.color || '';
      const newRange: ColoredRange = { start: formatDate(finalStart), end: formatDate(finalEnd), type: selectedLegendType, color: selectedLegendColor };

      setColoredRanges([...coloredRanges, newRange]);
      setRangeSelection({ start: null, end: null });
      setSelectedLegendType(null);
    }
  };

  const handlePersonalInfoChange = (field: 'firstName' | 'lastName', value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (index: number, field: "start" | "end", value: string): void => {
    if (value.length < displayPeriods[index][field].length) {
      handleDisplayChange(index, field, value, displayPeriods, setDisplayPeriods, periods, setPeriods, setValidationResult, setShowPopup);
      return;
    }

    const digitsOnly = value.replace(/\D/g, '');
    let formattedValue = '';

    if (digitsOnly.length > 0) {
      let days = digitsOnly.substring(0, 2);
      if (parseInt(days) > 31) days = '31';
      formattedValue = days;

      if (digitsOnly.length >= 2) {
        formattedValue += '/';
        if (digitsOnly.length > 2) {
          let months = digitsOnly.substring(2, 4);
          if (parseInt(months) > 12) months = '12';
          formattedValue += months;

          if (digitsOnly.length >= 4) {
            formattedValue += '/';
            if (digitsOnly.length > 4) {
              const year = digitsOnly.substring(4, 8);
              formattedValue += year;

              if (field === "start" && year.length === 4) {
                setTimeout(() => {
                  const nextInput = document.querySelector(`input[placeholder="DD/MM/RRRR"][value="${displayPeriods[index].end}"]`);
                  if (nextInput instanceof HTMLInputElement) {
                    nextInput.focus();
                  }
                }, 0);
              }
            }
          }
        }
      }
    }

    handleDisplayChange(index, field, formattedValue, displayPeriods, setDisplayPeriods, periods, setPeriods, setValidationResult, setShowPopup);
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  useEffect(() => {
    const validOnes = periods.filter(period => period.start && period.end);
    setValidPeriods(validOnes);
  }, [periods]);

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
        <div className="flex flex-wrap justify-center gap-4 p-4 w-full mb-6 bg-gray-800 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 p-2 rounded-lg w-full md:w-auto">
            <label className="font-medium text-sm">Imię:</label>
            <input
                type="text"
                value={personalInfo.firstName}
                onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                className="border p-2 text-sm rounded-lg w-40 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-lg w-full md:w-auto">
            <label className="font-medium text-sm">Nazwisko:</label>
            <input
                type="text"
                value={personalInfo.lastName}
                onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                className="border p-2 text-sm rounded-lg w-40 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">Wprowadź okresy</h1>
        <div className="flex flex-wrap items-center gap-4 p-4 w-full bg-gray-800 rounded-lg shadow-md">
          <div className="flex flex-row flex-wrap items-center gap-4">
            {periods.map((_period, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all">
                  <label className="font-medium text-sm">Rok {index + 1}:</label>
                  <input
                      type="text"
                      placeholder="DD/MM/RRRR"
                      value={displayPeriods[index].start}
                      onChange={(e) => handleDateChange(index, "start", e.target.value)}
                      className="px-3 py-2 rounded-lg border bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                      type="text"
                      placeholder="DD/MM/RRRR"
                      value={displayPeriods[index].end}
                      onChange={(e) => handleDateChange(index, "end", e.target.value)}
                      className="px-3 py-2 rounded-lg border bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  />
                  <button
                      onClick={() => handleDeletePeriod(index)}
                      disabled={periods.length === 1}
                      className={`text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-2 transition-all
                  ${periods.length === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    ×
                  </button>
                </div>
            ))}
            <button
                onClick={addNewPeriod}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>

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

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`h-8 text-xs border p-0.5 rounded-lg flex justify-center items-center cursor-pointer transition-all
                      ${isWeekend ? 'bg-red-900' : ''}
                      ${isHoliday ? 'bg-orange-900' : ''}
                      ${coloredRange ? coloredRange.color : ''}
                      ${selectedLegendType && 'hover:bg-gray-700'}
                      ${rangeSelection.start && currentDate?.getTime() === rangeSelection.start.getTime() ? 'bg-gray-600' : ''}`}
                                        onClick={() => currentDate && handleDayClick(currentDate)}
                                    >
                                      {day.day && (
                                          <div className={`${(isWeekend || isHoliday) ? 'text-red-400' : 'text-gray-400'}`}>
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
                    <PeriodStats coloredRanges={coloredRanges} periodIndex={periodIndex} periods={periods} />
                    <button
                        onClick={() => exportToPDF(personalInfo)}
                        className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all"
                    >
                      Zapisz PDF
                    </button>
                  </div>
              ))}
              <SpeedInsights/>
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