import { isPolishHoliday } from "./polishHolidays";
import {DateInput} from "@/types/Period";
import {getNormalizedDateRange} from "@/utils/helpers/getNormalizedDateRange";
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
    const range = getNormalizedDateRange(start, end);
    if (!range) {
        console.warn("Invalid date input:", { start, end });
        return 0;
    }

    const [startDate, endDate] = range;
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