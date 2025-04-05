import { parseDateString } from "./dateHelpers";
import { isPolishHoliday } from "./polishHolidays";

export type DateInput = string | Date;

/**
 * Parses either a string or a Date input into a valid Date object.
 */
const normalizeDate = (input: DateInput): Date => {
    if (input instanceof Date) return input;
    return parseDateString(input);
};

/**
 * Calculates the number of working days (Mon-Fri, excluding holidays),
 * optionally filtered by a custom period condition.
 *
 * Accepts either string (various formats) or Date objects.
 */
export const getWorkingDaysInRange = (
    start: DateInput,
    end: DateInput,
    isDateInBasePeriod?: (date: Date) => boolean
): number => {
    const startDate = normalizeDate(start);
    const endDate = normalizeDate(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn("Invalid date input:", { start, end });
        return 0;
    }

    let workingDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
        const dayOfWeek = current.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = isPolishHoliday(current);
        const isBase = isDateInBasePeriod ? isDateInBasePeriod(current) : true;

        if (!isWeekend && !isHoliday && isBase) {
            workingDays++;
        }

        current.setDate(current.getDate() + 1);
    }

    return workingDays;
};