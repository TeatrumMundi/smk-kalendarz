import { getWorkingDaysInRange } from "./getWorkingDaysInRange";
import {ColoredRange} from "@/types/Period";

export const getWorkingDaysByRangeType = (ranges: ColoredRange[]) => {
    const workingDaysByType: Record<string, number> = {};
    let total = 0;

    for (const range of ranges) {
        if (range.special) continue;

        const days : number = range.workingDays ?? getWorkingDaysInRange(range.start, range.end);
        workingDaysByType[range.type] = (workingDaysByType[range.type] || 0) + days;
        total += days;
    }

    return {
        workingDaysByType,
        totalColoredRangeDays: total,
    };
};
