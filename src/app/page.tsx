"use client";

import { useMemo } from "react";
import { handleDayClick as handleDayClickUtil } from "@/utils/calendar/handleDayClick";
import { generateCalendarData } from "@/utils/calendar/generateCalendarData";
import { useColoredRanges } from "@/hooks/useColoredRanges";
import { usePeriods } from "@/hooks/usePeriods";
import { usePersonalInfo } from "@/hooks/usePersonalInfo";
import { PersonalInfoForm, PeriodInput } from "@/components/calendarView";

import {legendItems} from "@/config/legendConfig";
import ErrorPopup from "@/components/errors/ErrorPopup";
import CalendarRenderer from "@/components/calendarView/CalendarRenderer";
export default function Home() {
  const {
    coloredRanges,
    setColoredRanges,
    selectedLegendType,
    setSelectedLegendType,
    rangeSelection,
    setRangeSelection,
    isDateInColoredRange,
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
    handleDateChange,
  } = usePeriods();

  const {
    personalInfo,
    setPersonalInfo,
    handlePersonalInfoChange,
  } = usePersonalInfo();

  const handlePeriodDelete = (index: number) => {
    handleDeletePeriod(index, coloredRanges, setColoredRanges);
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString || dateString.trim() === "") return null;
    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    } else if (dateString.includes("/") || dateString.includes(".")) {
      const [day, month, year] = dateString.split(/[/.]/).map(Number);
      return new Date(year, month - 1, day);
    }
    return null;
  };

  const isDateInBasePeriod = (date: Date, periodIndexStr: string): boolean => {
    const periodIndex = parseInt(periodIndexStr);
    if (periodIndex < 0 || periodIndex >= periods.length) return false;
    const period = periods[periodIndex];
    const startDate = parseDate(period.start);
    const endDate = parseDate(period.end);
    if (!startDate || !endDate) return false;
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return compareDate >= startDate && compareDate <= endDate;
  };

  const handleDayClick = (date: Date, periodIndex: string) => {
    const newSelectedType = handleDayClickUtil(
        date,
        coloredRanges,
        setColoredRanges,
        selectedLegendType,
        rangeSelection,
        setRangeSelection,
        legendItems,
        isDateInBasePeriod,
        periodIndex
    );
    if (newSelectedType !== null) {
      setSelectedLegendType(newSelectedType);
    }
  };

  const groupMonthsByPeriod = (months: { name: string; year: number; days: { day: number | null; periods: number[] }[] }[]) => {
    const periodGroups: Record<number, typeof months> = {};
    months.forEach((month) => {
      month.days.forEach((day) => {
        day.periods.forEach((periodIndex) => {
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
    return Object.fromEntries(
        Object.entries(groups).filter(([key]) => parseInt(key) < periods.length)
    );
  }, [memoizedCalendarData, periods.length]);

  return (
      <div className="max-w-full mx-auto p-4 text-center relative bg-gray-900 min-h-screen text-gray-100">
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
            <CalendarRenderer
                periodGroups={periodGroups}
                periods={periods}
                selectedLegendType={selectedLegendType}
                setSelectedLegendType={setSelectedLegendType}
                isDateInColoredRange={isDateInColoredRange}
                isDateInBasePeriod={isDateInBasePeriod}
                handleDayClick={handleDayClick}
                rangeSelection={rangeSelection}
                coloredRanges={coloredRanges}
                personalInfo={personalInfo}
                setPeriods={setPeriods}
                setDisplayPeriods={setDisplayPeriods}
                setColoredRanges={setColoredRanges}
                setPersonalInfo={setPersonalInfo}
            />
        ) : (
            <div className="mt-6 text-gray-400">
              Wprowadź kompletne okresy, aby zobaczyć kalendarz
            </div>
        )}

        <ErrorPopup show={showPopup && !validationResult.isValid} message={validationResult.errorMessage} />
      </div>
  );
}
