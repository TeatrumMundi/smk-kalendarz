export const isDateInRange = (date: Date, range: { start: string, end: string }) => {
    const parseDate = (dateStr: string) => {
        const delimiter = dateStr.includes('.') ? '.' : dateStr.includes('/') ? '/' : null;
        if (!delimiter) return null;

        const [day, month, year] = dateStr.split(delimiter).map(Number);
        return new Date(year, month - 1, day);
    };

    const rangeStart = parseDate(range.start);
    const rangeEnd = parseDate(range.end);

    if (!rangeStart || !rangeEnd) {
        console.error("Invalid date format. Expected '.' or '/' as separators.");
        return false;
    }

    return date >= rangeStart && date <= rangeEnd;
};
