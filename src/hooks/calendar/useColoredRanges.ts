import { useState, useEffect } from "react";
import { ColoredRange } from "@/types/Period";
import { isDateInRange } from "@/utils/helpers/dateHelpers";

/**
 * useColoredRanges
 *
 * Manages all state and logic related to colored date ranges in the calendar.
 * - Stores the current colored ranges and selected legend type (color category)
 * - Tracks the start and end of range selection
 * - Persists state to localStorage (for SSR hydration and user experience)
 * - Provides helper to check if a given date falls into a colored range
 *
 * @returns Object containing state variables, setters, and utility for colored range logic
 */
export const useColoredRanges = () => {
    // Holds all user-selected colored date ranges (persisted in localStorage)
    const [coloredRanges, setColoredRanges] = useState<ColoredRange[]>(() => {
        if (typeof window !== "undefined") {
            const savedColoredRanges = localStorage.getItem("coloredRanges");
            return savedColoredRanges ? JSON.parse(savedColoredRanges) : [];
        }
        return [];
    });

    // Keeps track of which "legend type" (color category) is currently active
    const [selectedLegendType, setSelectedLegendType] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            const savedLegendType = localStorage.getItem("selectedLegendType");
            return savedLegendType ? JSON.parse(savedLegendType) : null;
        }
        return null;
    });

    // Tracks the current selection window (start and end) while the user selects a range
    const [rangeSelection, setRangeSelection] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null,
    });

    // Sync coloredRanges to localStorage on change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("coloredRanges", JSON.stringify(coloredRanges));
        }
    }, [coloredRanges]);

    // Sync selectedLegendType to localStorage on change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("selectedLegendType", JSON.stringify(selectedLegendType));
        }
    }, [selectedLegendType]);

    /**
     * Checks if a specific date is within any of the defined colored ranges
     * for the given calendar month/year.
     *
     * @param date The Date object to check
     * @param month The calendar month being rendered
     * @param year The calendar year being rendered
     * @returns The last matching range if found, otherwise null
     */
    const isDateInColoredRange = (date: Date, month: number, year: number) => {
        if (date.getMonth() !== month || date.getFullYear() !== year) return null;

        const matchingRanges = coloredRanges.filter((range) => isDateInRange(date, range));
        return matchingRanges.length > 0 ? matchingRanges[matchingRanges.length - 1] : null;
    };

    return {
        coloredRanges,
        setColoredRanges,
        selectedLegendType,
        setSelectedLegendType,
        rangeSelection,
        setRangeSelection,
        isDateInColoredRange,
    };
};
