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

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export const isPolishHoliday = (date: Date): boolean => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    // Fixed Polish holidays
    const fixedHolidays = [
        { day: 1, month: 1 },  // New Year
        { day: 6, month: 1 },  // Three Kings
        { day: 1, month: 5 },  // Labor Day
        { day: 3, month: 5 },  // Constitution Day
        { day: 15, month: 8 }, // Assumption Day
        { day: 1, month: 11 }, // All Saints
        { day: 11, month: 11 }, // Independence Day
        { day: 25, month: 12 }, // Christmas Day
        { day: 26, month: 12 }, // Second Christmas Day
    ];

    // Check fixed holidays
    if (fixedHolidays.some(holiday => holiday.day === day && holiday.month === month)) {
        return true;
    }

    // Calculate Easter and related movable holidays for the current year
    const easter = calculateEaster(year);
    const easterMonday = addDays(easter, 1);
    const corpusChristi = addDays(easter, 60);
    const pentecost = addDays(easter, 49);

    // Check movable holidays
    const movableHolidays = [
        easter,
        easterMonday,
        corpusChristi,
        pentecost
    ];

    return movableHolidays.some(holiday =>
        holiday.getDate() === day &&
        holiday.getMonth() + 1 === month
    );
};
