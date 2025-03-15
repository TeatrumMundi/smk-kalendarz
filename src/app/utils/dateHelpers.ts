export const isDateInRange = (date: Date, range: { start: string; end: string }): boolean => {
    // Parse the range start and end dates
    const [startDay, startMonth, startYear] = range.start.split(/[\/.]/).map(Number);
    const [endDay, endMonth, endYear] = range.end.split(/[\/.]/).map(Number);

    // Create Date objects for comparison
    const rangeStart = new Date(startYear, startMonth - 1, startDay);
    const rangeEnd = new Date(endYear, endMonth - 1, endDay);

    // Reset time components for accurate date comparison
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Check if the date is within the range (inclusive)
    return compareDate >= rangeStart && compareDate <= rangeEnd;
};
