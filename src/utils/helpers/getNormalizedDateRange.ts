import { parseDateString } from "./dateHelpers";
import {DateInput} from "@/types/Period";


/**
 * Converts two date inputs to valid Date objects and ensures chronological order.
 * Returns null if any input is invalid.
 */
export const getNormalizedDateRange = (
    start: DateInput,
    end: DateInput
): [Date, Date] | null => {
    const startDate = start instanceof Date ? start : parseDateString(start);
    const endDate = end instanceof Date ? end : parseDateString(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

    return startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
};
