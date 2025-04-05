import {CalendarMonth} from "@/components/calendarView/CalendarRenderer";

export type Period = {
    start: string;
    end: string;
};

export interface ColoredRange {
    start: string;
    end: string;
    type: string;
    color: string;
    label?: string;

    totalDays?: number;
    workingDays?: number;
}

export type PersonalInfo = {
    firstName: string;
    lastName: string;
};

export interface GroupedRangeResult {
    grouped: Record<string, ColoredRange[]>;
    totalWorkingDays: number;
    coloredRangeDays: number;
    basicPeriodDays: number;
}

export type DateInput = string | Date;

export interface PeriodStatsProps {
    coloredRanges: ColoredRange[];
    periodIndex: string;
    periods: Array<{ start: string; end: string; }>;
    selectedType?: string | null;
    onSelectType: (type: string | null) => void;
}

export interface MonthViewProps {
    month: CalendarMonth;
    periodIndex: string;
    selectedLegendType: string | null;
    isDateInColoredRange: (date: Date, month: number, year: number) => ColoredRange | null;
    isDateInBasePeriod: (date: Date, periodIndex: string) => boolean;
    handleDayClick: (date: Date, periodIndex: string) => void;
    rangeSelection: { start: Date | null };
}