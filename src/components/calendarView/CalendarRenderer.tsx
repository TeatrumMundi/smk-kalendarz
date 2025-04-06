import React from "react";
import { getCalendarDaysInRange } from "@/utils/helpers/getCalendarDaysInRange";
import { PDFButton, ExcelButton, ResetButton } from "@/components/buttons";
import { PeriodStats } from "@/components/calendarView";
import { ColoredRange, Period } from "@/types/Period";
import MonthView from "@/components/calendarView/MonthView";
import { LegendSelector } from "@/components/calendarView/LegendSelector";
import {NameInputModal} from "@/components/calendarView/NameInputModal";


export interface PersonalInfo {
    firstName: string;
    lastName: string;
}

interface LabelModalData {
    start: Date;
    end: Date;
    type: string;
    color: string;
    onConfirm: (label?: string) => void;
}

interface CalendarRendererProps {
    periodGroups: Record<string, CalendarMonth[]>;
    periods: Period[];
    selectedLegendType: string | null;
    setSelectedLegendType: React.Dispatch<React.SetStateAction<string | null>>;
    isDateInColoredRange: (date: Date, month: number, year: number) => ColoredRange | null;
    isDateInBasePeriod: (date: Date, periodIndex: string) => boolean;
    handleDayClick: (date: Date, periodIndex: string) => void;
    rangeSelection: { start: Date | null };
    coloredRanges: ColoredRange[];
    personalInfo: PersonalInfo;
    setPeriods: React.Dispatch<React.SetStateAction<Period[]>>;
    setDisplayPeriods: React.Dispatch<React.SetStateAction<Period[]>>;
    setColoredRanges: React.Dispatch<React.SetStateAction<ColoredRange[]>>;
    setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
    modalData: LabelModalData | null;
    setModalData: (value: LabelModalData | null) => void;
}

export interface CalendarDay {
    day: number | null;
    periods: number[];
}

export interface CalendarMonth {
    name: string;
    year: number;
    days: CalendarDay[];
}

export default function CalendarRenderer({
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
                                             setPersonalInfo,
                                             modalData,
                                             setModalData,
                                         }: CalendarRendererProps) {
    return (
        <div id="calendar-container" className="mt-6">
            {Object.entries(periodGroups).map(([periodIndex, months]) => {
                const period = periods[parseInt(periodIndex)];
                return (
                    <div key={periodIndex} className="mb-8">
                        <h2 className="text-xl font-bold mb-2 border-b pb-2 text-gray-100">
                            Rok {parseInt(periodIndex) + 1}
                            {period.start && period.end && (
                                <span className="ml-2 text-gray-400">
                  Ilość dni: {getCalendarDaysInRange(period.start, period.end)}
                </span>
                            )}
                        </h2>

                        <LegendSelector
                            selectedLegendType={selectedLegendType}
                            setSelectedLegendTypeAction={setSelectedLegendType}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                            {months.map((month, monthIndex) => (
                                <MonthView
                                    key={monthIndex}
                                    month={month}
                                    periodIndex={periodIndex}
                                    selectedLegendType={selectedLegendType}
                                    isDateInColoredRange={isDateInColoredRange}
                                    isDateInBasePeriod={isDateInBasePeriod}
                                    handleDayClick={(date) => handleDayClick(date, periodIndex)}
                                    rangeSelection={rangeSelection}
                                    coloredRanges={coloredRanges}
                                />

                            ))}
                        </div>

                        <PeriodStats
                            coloredRanges={coloredRanges}
                            periodIndex={periodIndex}
                            periods={periods}
                            selectedType={selectedLegendType}
                            onSelectType={setSelectedLegendType}
                        />

                        <PDFButton
                            personalInfo={personalInfo}
                            coloredRanges={coloredRanges}
                            periods={periods}
                        />
                        <ExcelButton personalInfo={personalInfo} coloredRanges={coloredRanges} periods={periods} />
                        <ResetButton
                            setPeriods={setPeriods}
                            setDisplayPeriods={setDisplayPeriods}
                            setColoredRanges={setColoredRanges}
                            setPersonalInfo={setPersonalInfo}
                        />
                    </div>
                );
            })}

            {modalData && (
                <NameInputModal
                    isOpen={true}
                    start={modalData.start}
                    end={modalData.end}
                    onCloseAction={() => setModalData(null)}
                    onSubmitAction={(label : string) => {
                        modalData.onConfirm(label);
                        setModalData(null);
                    }}
                />
            )}
        </div>
    );
}
