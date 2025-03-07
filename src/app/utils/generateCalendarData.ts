import { Period } from "@/app/types/Period";

export const generateCalendarData = (validPeriods: Period[]) => {
    // Find min and max dates to determine calendar range
    let minDate = new Date();  // Initialize with current date instead of null
    let maxDate = new Date();  // Initialize with current date instead of null
    let hasValidDates = false;

    if (validPeriods.length === 0) {
        return { months: [], hasData: false };
    }

    validPeriods.forEach(period => {
        if (period.start && period.end) {
            const startDate = new Date(period.start);
            const endDate = new Date(period.end);

            if (!hasValidDates || startDate < minDate) {
                minDate = startDate;
            }

            if (!hasValidDates || endDate > maxDate) {
                maxDate = endDate;
            }

            hasValidDates = true;
        }
    });

    if (!hasValidDates) {
        return { months: [], hasData: false };
    }

    // Rest of the code remains the same
    const minYear = minDate.getFullYear();
    const minMonth = minDate.getMonth();
    const maxYear = maxDate.getFullYear();
    const maxMonth = maxDate.getMonth();

    minDate = new Date(minYear, minMonth, 1);
    maxDate = new Date(maxYear, maxMonth + 1, 0);

    // Generate months data
    const months: Array<{ name: string, year: number, days: Array<{ day: number | null, periods: number[] }> }> = [];
    const currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthName = new Date(year, month, 1).toLocaleDateString('pl-PL', { month: 'long' });
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const firstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        const days: Array<{ day: number | null, periods: number[] }> = [];

        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, periods: [] });
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const periodsOnDay: number[] = [];

            // Check which periods include this day
            for (let i = 0; i < validPeriods.length; i++) {
                if (validPeriods[i].start && validPeriods[i].end) {
                    const periodStart = new Date(validPeriods[i].start);
                    const periodEnd = new Date(validPeriods[i].end);

                    if (date >= periodStart && date <= periodEnd) {
                        periodsOnDay.push(i);
                    }
                }
            }

            days.push({
                day,
                periods: periodsOnDay
            });
        }

        months.push({
            name: monthName,
            year,
            days
        });

        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return { months, hasData: true };
};
