import { parseDateString } from "./dateHelpers";
import { GroupedRangeResult, ColoredRange } from "@/types/Period";
import { getWorkingDaysInRange } from "@/utils/helpers/getWorkingDaysInRange";

/**
 * Calculates the working-day index (1-based) of a given date within a colored range.
 * Returns `null` if the date is before the range starts.
 *
 * Example: For a range starting on 01.01.2024 (Monday),
 *   - 01.01.2024 → 1- * 02.01.2024 → 2
 *   - Weekend → skipped
 *
 * @param {Date} date - Date to check the index for
 * @param {string} rangeStartStr - Start date of the range (e.g. "01.01.2024")
 * @returns {number | null} Working day index or null if date is outside range
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
 * Groups and summarizes all colored ranges that intersect with a given period.
 * It returns:
 * - Grouped ranges by their `type`
 * - Total number of working days in the base period
 * - Total working days inside colored ranges
 * - Remaining working days in the base period
 *
 * @param {ColoredRange[]} coloredRanges - All user-defined colored ranges
 * @param {string} periodStart - Start of the base period (any accepted format)
 * @param {string} periodEnd - End of the base period
 * @returns {GroupedRangeResult} Object with grouped data and stats
 */
export const groupAndSummarizeRanges = (
    coloredRanges: ColoredRange[],
    periodStart: string,
    periodEnd: string
): GroupedRangeResult => {
    const periodStartDate = parseDateString(periodStart);
    const periodEndDate = parseDateString(periodEnd);

    // 🎯 Filter only those colored ranges that intersect with the period
    const filteredRanges = coloredRanges.filter((range) => {
        const rangeStart = parseDateString(range.start);
        const rangeEnd = parseDateString(range.end);
        return rangeStart <= periodEndDate && rangeEnd >= periodStartDate;
    });

    // 📦 Group by range type (e.g., Work, Holiday)
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
 * Formats the grouped colored range stats into a clean multi-line string,
 * ready for copying to the clipboard or export.
 *
 * Example output:
 * ```
 * Okres podstawowy ilość dni: 20-5 = 15
 * Urlop (delegacja): 03.01.2024-07.01.2024 - 5 dni roboczych
 * Chorobowe: 09.01.2024 - 1 dni roboczych
 * ```
 *
 * @param {Record<string, ColoredRange[]>} grouped - Grouped colored ranges by type
 * @param {number} totalWorkingDays - Total working days in base period
 * @param {number} coloredRangeDays - Working days inside colored ranges
 * @returns {string} Formatted plain-text summary
 */
export const formatStatsForClipboard = (
    grouped: Record<string, ColoredRange[]>,
    totalWorkingDays: number,
    coloredRangeDays: number
): string => {
    const basicPeriodDays = totalWorkingDays - coloredRangeDays;

    const basicLine = `Okres podstawowy ilość dni: ${totalWorkingDays} - ${coloredRangeDays} = ${basicPeriodDays}`;

    const lines = Object.entries(grouped).map(([type, ranges]) => {
        const totalDays = ranges.reduce((sum, r) => sum + (r.workingDays ?? 0), 0);
        const rangeText = ranges
            .map((r) => (r.start === r.end ? r.start : `${r.start}-${r.end}`))
            .join(", ");
        return `${type}: ${rangeText} = ${totalDays} dni roboczych`;
    });

    return [basicLine, ...lines].join("\n");
};
