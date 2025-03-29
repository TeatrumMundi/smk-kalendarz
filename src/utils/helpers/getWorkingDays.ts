import {isPolishHoliday} from "@/utils/helpers/polishHolidays";

export const getWorkingDaysInMonth = (year: number, month: number): number => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    let workingDays = 0;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isPolishHoliday(currentDate)) {
            workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
};
