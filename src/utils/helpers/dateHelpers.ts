/**
 * Parses a date string in various formats into a valid Date object.
 * Supported formats:
 * - "YYYY-MM-DD"
 * - "DD/MM/YYYY"
 * - "DD.MM.YYYY"
 *
 * @param {string} str - The date string to parse
 * @returns {Date} Parsed Date object
 */
export const parseDateString = (str: string): Date => {
    if (str.includes("-")) {
        // ISO format: YYYY-MM-DD
        const [y, m, d] = str.split("-").map(Number);
        return new Date(y, m - 1, d);
    }

    // Format: DD/MM/YYYY or DD.MM.YYYY
    const [d, m, y] = str.split(/[./]/).map(Number);
    return new Date(y, m - 1, d);
};

/**
 * Checks whether two Date objects represent the same calendar day.
 *
 * @param {Date} a - First date
 * @param {Date} b - Second date
 * @returns {boolean} True if both dates are the same day, false otherwise
 */
export const isSameDate = (a: Date, b: Date): boolean =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

/**
 * Determines whether a given date falls within a specified date range (inclusive).
 * The range values are provided as strings in "DD/MM/YYYY" or "DD.MM.YYYY" format.
 *
 * @param {Date} date - Date to check
 * @param {{ start: string, end: string }} range - Date range (inclusive)
 * @returns {boolean} True if the date is within the range, false otherwise
 */
export const isDateInRange = (
    date: Date,
    range: { start: string; end: string }
): boolean => {
    // Convert string range to Date objects
    const rangeStart = parseDateString(range.start);
    const rangeEnd = parseDateString(range.end);

    // Normalize the compared date (strip time)
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Check if compareDate is within the range
    return compareDate >= rangeStart && compareDate <= rangeEnd;
};
