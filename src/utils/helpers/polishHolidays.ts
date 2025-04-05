/**
 * Calculates the date of Easter Sunday for a given year.
 * Based on the algorithm known as Computes (used by Western Christian Churches).
 *
 * @param {number} year - The year for which to calculate Easter
 * @returns {Date} A Date object representing Easter Sunday
 */
function calculateEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day);
}

/**
 * Returns a new date increased by a given number of days.
 *
 * @param {Date} date - The base date
 * @param {number} days - Number of days to add
 * @returns {Date} New Date object with days added
 */
function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Determines if a given date is a Polish national holiday.
 * Includes both fixed-date holidays and calculated moveable feasts:
 * - Easter Sunday
 * - Easter Monday
 * - Pentecost (49 days after Easter)
 * - Corpus Christi (60 days after Easter)
 *
 * @param {Date} date - Date to evaluate
 * @returns {boolean} True if the date is a Polish holiday, false otherwise
 */
export const isPolishHoliday = (date: Date): boolean => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // JS months are 0-based
    const year = date.getFullYear();

    // 🗓️ Fixed-date public holidays in Poland
    const fixedHolidays = [
        { day: 1, month: 1 },   // New Year's Day
        { day: 6, month: 1 },   // Epiphany (Three Kings)
        { day: 1, month: 5 },   // Labor Day
        { day: 3, month: 5 },   // Constitution Day
        { day: 15, month: 8 },  // Assumption of Mary
        { day: 1, month: 11 },  // All Saints' Day
        { day: 11, month: 11 }, // Independence Day
        { day: 25, month: 12 }, // Christmas Day
        { day: 26, month: 12 }, // Second Christmas Day
    ];

    // ✅ Check fixed holidays
    const isFixedHoliday = fixedHolidays.some(h => h.day === day && h.month === month);
    if (isFixedHoliday) return true;

    // 🔄 Calculate moveable holidays for the current year
    const easter = calculateEaster(year);
    const easterMonday = addDays(easter, 1);
    const pentecost = addDays(easter, 49);
    const corpusChristi = addDays(easter, 60);

    const movableHolidays = [easter, easterMonday, pentecost, corpusChristi];

    // ✅ Check if the current date matches any moveable holiday
    return movableHolidays.some(holiday =>
        holiday.getDate() === day && holiday.getMonth() + 1 === month
    );
};
