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