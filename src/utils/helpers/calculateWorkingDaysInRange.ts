import { isPolishHoliday } from "@/utils/helpers/polishHolidays";

export const calculateWorkingDaysInRange = (
    start: Date,
    end: Date,
    isDateInBasePeriod?: (date: Date) => boolean
): number => {
    let workingDays = 0;
    const current = new Date(start);

    while (current <= end) {
        const dayOfWeek = current.getDay();
        const isBase = isDateInBasePeriod ? isDateInBasePeriod(current) : true;

        if (isBase && dayOfWeek !== 0 && dayOfWeek !== 6 && !isPolishHoliday(current)) {
            workingDays++;
        }

        current.setDate(current.getDate() + 1);
    }

    return workingDays;
};
