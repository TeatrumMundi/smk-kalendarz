import {useMemo, useState} from "react";
import { handleDayClick as handleDayClickUtil } from "@/utils/calendar/handleDayClick";
import { generateCalendarData } from "@/utils/calendar/generateCalendarData";
import { legendItems } from "@/config/legendConfig";
import {
    usePeriods,
    useColoredRanges,
    usePersonalInfo,
} from "@/hooks/calendar";

/**
 * useCalendarPageLogic
 *
 * Combines and orchestrates all state, business logic, and derived data
 * required for rendering the calendar view page. It manages:
 *
 * - Personal info input (name/title)
 * - Periods and date range validation
 * - Colored range selections
 * - Calendar data generation and grouping
 * - Logic for day selection and highlighting
 *
 * This hook encapsulates complex interdependent logic for reusability and
 * clean separation from the UI layer.
 *
 * @returns Combined state and handlers required by the calendar page
 */
export function useCalendarPageLogic() {
    // Hook for managing selected color ranges, selection state, and legend type
    const coloredState = useColoredRanges();

    // Hook for managing user-defined date periods and their validation
    const periodState = usePeriods();

    // Hook for handling user's personal information (e.g., name/title)
    const personalState = usePersonalInfo();

    /**
     * Parses a date string in supported formats to a Date object.
     * Supports formats like "YYYY-MM-DD", "DD/MM/YYYY", "DD.MM.YYYY".
     */
    const parseDate = (dateString: string): Date | null => {
        if (!dateString?.trim()) return null;

        if (dateString.includes("-")) {
            const [year, month, day] = dateString.split("-").map(Number);
            return new Date(year, month - 1, day);
        } else if (dateString.includes("/") || dateString.includes(".")) {
            const [day, month, year] = dateString.split(/[/.]/).map(Number);
            return new Date(year, month - 1, day);
        }

        return null;
    };

    /**
     * Deletes a user-defined period and simultaneously clears
     * any colored ranges associated with it.
     */
    const handlePeriodDelete = (index: number) => {
        periodState.handleDeletePeriod(index, coloredState.coloredRanges, coloredState.setColoredRanges);
    };

    /**
     * Checks if a specific date falls within a given base period.
     * Used to determine whether a date is eligible for colored range selection.
     */
    const isDateInBasePeriod = (date: Date, periodIndexStr: string): boolean => {
        const index = parseInt(periodIndexStr);
        const period = periodState.periods[index];
        if (!period) return false;

        const startDate = parseDate(period.start);
        const endDate = parseDate(period.end);
        if (!startDate || !endDate) return false;

        const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return compareDate >= startDate && compareDate <= endDate;
    };

    const [modalData, setModalData] = useState<{
        start: Date;
        end: Date;
        type: string;
        color: string;
        onConfirm: (label?: string) => void;
    } | null>(null);

    /**
     * Handles logic triggered when a user clicks on a calendar day.
     * Responsible for toggling colored ranges based on the selected legend type.
     */
    const handleDayClick = (date: Date, periodIndex: string) => {
        const newSelectedType = handleDayClickUtil(
            date,
            coloredState.coloredRanges,
            coloredState.setColoredRanges,
            coloredState.selectedLegendType,
            coloredState.rangeSelection,
            coloredState.setRangeSelection,
            legendItems,
            isDateInBasePeriod,
            periodIndex,
            setModalData
        );

        if (newSelectedType !== null) {
            coloredState.setSelectedLegendType(newSelectedType);
        }
    };

    /**
     * Groups calendar months by associated period index for rendering.
     * This is used to split the calendar into separate blocks for each period.
     */
    const groupMonthsByPeriod = (
        months: {
            name: string;
            year: number;
            days: { day: number | null; periods: number[] }[];
        }[]
    ) => {
        const periodGroups: Record<number, typeof months> = {};

        months.forEach((month) => {
            month.days.forEach((day) => {
                day.periods.forEach((periodIndex) => {
                    if (!periodGroups[periodIndex]) periodGroups[periodIndex] = [];
                    if (!periodGroups[periodIndex].includes(month)) {
                        periodGroups[periodIndex].push(month);
                    }
                });
            });
        });

        return periodGroups;
    };

    /**
     * Generates memoized calendar data based on the currently valid periods.
     * Prevents unnecessary computation on re-renders.
     */
    const memoizedCalendarData = useMemo(
        () => generateCalendarData(periodState.validPeriods),
        [periodState.validPeriods]
    );

    /**
     * Groups generated calendar data into visual sections per period.
     * Memoized for performance and stability.
     */
    const periodGroups = useMemo(() => {
        if (!memoizedCalendarData.hasData) return {};
        const groups = groupMonthsByPeriod(memoizedCalendarData.months);

        return Object.fromEntries(
            Object.entries(groups).filter(([key]) => parseInt(key) < periodState.periods.length)
        );
    }, [memoizedCalendarData, periodState.periods.length]);

    return {
        ...coloredState,
        ...periodState,
        ...personalState,
        memoizedCalendarData,
        periodGroups,
        handlePeriodDelete,
        handleDayClick,
        isDateInBasePeriod,
        modalData,
        setModalData,
    };
}
