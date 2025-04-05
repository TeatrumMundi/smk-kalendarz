import { parseDateString } from "./dateHelpers";
import {GroupedRangeResult, ColoredRange} from "@/types/Period";
import {getWorkingDaysInRange} from "@/utils/helpers/getWorkingDaysInRange";

/**
 * Calculates the working-day index of a given date within a colored range.
 * Returns null if the date is outside the range.
 */
export const calculateRangeIndex = (
    date: Date,
    rangeStartStr: string
): number | null => {
    const rangeStart = parseDateString(rangeStartStr);

    if (date < rangeStart) return null;

    let count = 0;
    const current = new Date(rangeStart);

    while (current <= date) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
};

/**
 * Groups and summarizes colored ranges for a given period.
 * Calculates working days, filters overlapping ranges, and groups them by type.
 */
export const groupAndSummarizeRanges = (
    coloredRanges: ColoredRange[],
    periodStart: string,
    periodEnd: string
): GroupedRangeResult => {
    const periodStartDate = parseDateString(periodStart);
    const periodEndDate = parseDateString(periodEnd);

    const filteredRanges = coloredRanges.filter((range) => {
        const rangeStart = parseDateString(range.start);
        const rangeEnd = parseDateString(range.end);
        return rangeStart <= periodEndDate && rangeEnd >= periodStartDate;
    });

    const grouped = filteredRanges.reduce((acc, range) => {
        const key = range.type;
        if (!acc[key]) acc[key] = [];
        acc[key].push(range);
        return acc;
    }, {} as Record<string, ColoredRange[]>);

    const totalWorkingDays = getWorkingDaysInRange(periodStart, periodEnd);
    const coloredRangeDays = filteredRanges.reduce((sum, range) => {
        return sum + getWorkingDaysInRange(range.start, range.end);
    }, 0);

    const basicPeriodDays = totalWorkingDays - coloredRangeDays;

    return {
        grouped,
        totalWorkingDays,
        coloredRangeDays,
        basicPeriodDays,
    };
};

/**
 * Converts grouped colored ranges into a multiline text summary for clipboard.
 * Includes basic period stats and breakdown per legend type.
 */
export const formatStatsForClipboard = (
    grouped: Record<string, ColoredRange[]>,
    totalWorkingDays: number,
    coloredRangeDays: number
): string => {
    const basicPeriodDays = totalWorkingDays - coloredRangeDays;

    const basicLine = `Okres podstawowy ilość dni: ${totalWorkingDays} - ${coloredRangeDays} = ${basicPeriodDays}`;

    const lines = Object.entries(grouped).flatMap(([type, ranges]) =>
        ranges.map((range) => {
            const label = range.label ? ` (${range.label})` : "";
            const dateRange = range.start === range.end ? range.start : `${range.start}-${range.end}`;
            const days = getWorkingDaysInRange(range.start, range.end);
            return `${type}${label}: ${dateRange} - ${days} dni roboczych`;
        })
    );

    return [basicLine, ...lines].join("\n");
};