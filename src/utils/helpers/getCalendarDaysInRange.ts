/**
 * Returns the total number of calendar days between two dates, inclusive.
 * Accepts either Date objects or string representations (e.g., '2024-01-01', '01.01.2024').
 *
 * Returns 0 if any of the inputs are invalid or empty.
 *
 * @param {string | Date} start - The start date of the range
 * @param {string | Date} end - The end date of the range
 * @returns {number} The total number of calendar days (inclusive of both start and end)
 */
export const getCalendarDaysInRange = (start: string | Date, end: string | Date): number => {
    if (!start || !end) return 0;

    const startDate: Date = new Date(start);
    const endDate: Date = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

    const diffTime: number = Math.abs(endDate.getTime() - startDate.getTime());

    // Divide milliseconds into days and add 1 to include both start and end dates
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};
