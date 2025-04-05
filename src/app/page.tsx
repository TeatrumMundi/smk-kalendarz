"use client";

import { PersonalInfoForm, PeriodInput } from "@/components/calendarView";
import CalendarRenderer from "@/components/calendarView/CalendarRenderer";
import ErrorPopup from "@/components/errors/ErrorPopup";
import {useCalendarPageLogic} from "@/hooks/calendar/useCalendarPageLogic";

export default function Home() {
  const {
    personalInfo,
    handlePersonalInfoChange,
    periods,
    displayPeriods,
    handleDateChange,
    handlePeriodDelete,
    addNewPeriod,
    memoizedCalendarData,
    periodGroups,
    selectedLegendType,
    setSelectedLegendType,
    isDateInColoredRange,
    isDateInBasePeriod,
    handleDayClick,
    rangeSelection,
    coloredRanges,
    setPeriods,
    setDisplayPeriods,
    setColoredRanges,
    setPersonalInfo,
    showPopup,
    validationResult,
  } = useCalendarPageLogic();

  return (
      <div className="max-w-full mx-auto p-4 text-center relative bg-gray-900 min-h-screen text-gray-100">
        {/* Personal info form */}
        <PersonalInfoForm
            personalInfo={personalInfo}
            handlePersonalInfoChange={handlePersonalInfoChange}
        />

        <h1 className="text-2xl font-bold mb-6">Wprowadź okresy</h1>

        {/* Period inputs */}
        <PeriodInput
            periods={periods}
            displayPeriods={displayPeriods}
            handleDateChange={handleDateChange}
            handleDeletePeriod={handlePeriodDelete}
            addNewPeriod={addNewPeriod}
        />

        {/* Calendar */}
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

        {/* Error popup */}
        <ErrorPopup
            show={showPopup && !validationResult.isValid}
            message={validationResult.errorMessage}
        />
      </div>
  );
}
