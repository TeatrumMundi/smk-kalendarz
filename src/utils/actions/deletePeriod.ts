import { ColoredRange, Period } from "@/types/Period";
import { parseDateString } from "@/utils/helpers/dateHelpers";

/**
 * Deletes a period and its display representation from their respective lists.
 * Also removes any colored ranges assigned to the same year as the deleted period.
 *
 * Requirements:
 * - At least one period must remain (function skips if only one period exists).
 * - Only complete periods (with both start and end) trigger cleanup of colored ranges.
 * - Dates are matched by comparing years (from start date).
 *
 * @param indexToDelete - Index of the period to be removed
 * @param periods - List of current base periods
 * @param setPeriods - Setter to update base periods
 * @param displayPeriods - Human-readable date representation (e.g., DD/MM/YYYY)
 * @param setDisplayPeriods - Setter to update displayPeriods
 * @param coloredRanges - User-defined colored date ranges
 * @param setColoredRanges - Setter to update coloredRanges
 */
export const deletePeriod = (
    indexToDelete: number,
    periods: Period[],
    setPeriods: (periods: Period[]) => void,
    displayPeriods: { start: string; end: string }[],
    setDisplayPeriods: (displayPeriods: { start: string; end: string }[]) => void,
    coloredRanges: ColoredRange[],
    setColoredRanges: (ranges: ColoredRange[]) => void
) => {
    // 🛑 Do not delete if only one period remains
    if (periods.length <= 1) return;

    // 🧪 Safety check for index bounds
    if (indexToDelete < 0 || indexToDelete >= periods.length) return;

    const periodToDelete = periods[indexToDelete];

    // 🧹 Remove related colored ranges (if the period has valid dates)
    if (periodToDelete?.start && periodToDelete?.end) {
        const periodYear = new Date(periodToDelete.start).getFullYear();

        const updatedRanges = coloredRanges.filter(range => {
            const parsed = parseDateString(range.start);
            return parsed.getFullYear() !== periodYear;
        });

        setColoredRanges(updatedRanges);
    }

    // ✂️ Remove the period and its display value
    const newPeriods = [...periods];
    const newDisplayPeriods = [...displayPeriods];

    newPeriods.splice(indexToDelete, 1);
    newDisplayPeriods.splice(indexToDelete, 1);

    // 🔄 Update state
    setPeriods(newPeriods);
    setDisplayPeriods(newDisplayPeriods);
};