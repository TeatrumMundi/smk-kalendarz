import { isPolishHoliday } from './polishHolidays';

export const getWorkingDaysInRange = (start: string, end: string): number => {
    console.log('Input dates:', start, end);

    // Convert DD/MM/YYYY to YYYY-MM-DD
    const convertDateFormat = (dateStr: string) => {
        const [day, month, year] = dateStr.split(/[\/.]/);
        return `${year}-${month}-${day}`;
    };

    try {
        const startDate = new Date(convertDateFormat(start));
        const endDate = new Date(convertDateFormat(end));

        console.log('Converted dates:', startDate, endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.log('Invalid date conversion');
            return 0;
        }

        let workingDays = 0;
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isHoliday = isPolishHoliday(currentDate);

            if (!isWeekend && !isHoliday) {
                workingDays++;
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log('Calculated working days:', workingDays);
        return workingDays;
    } catch (err) {
        console.error('Date calculation error:', err);
        return 0;
    }
};
