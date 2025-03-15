// Add these functions to src/app/utils/statePersistence.ts

import {ColoredRange, Period} from "@/app/types/Period";

interface AppState {
    periods: Period[];
    displayPeriods: Array<{start: string, end: string}>;
    coloredRanges: ColoredRange[];
    personalInfo: {
        firstName: string;
        lastName: string;
    };
}

// Save the current state to localStorage
export const saveStateToLocalStorage = (
    periods: Period[],
    displayPeriods: Array<{start: string, end: string}>,
    coloredRanges: ColoredRange[],
    personalInfo: {firstName: string, lastName: string}
): void => {
    try {
        const state: AppState = {
            periods,
            displayPeriods,
            coloredRanges,
            personalInfo
        };

        localStorage.setItem('calendarAppState', JSON.stringify(state));

        // Save timestamp to manage expiration
        localStorage.setItem('calendarAppStateTimestamp', Date.now().toString());
    } catch (error) {
        console.error('Failed to save state to localStorage:', error);
    }
};

// Retrieve the state from localStorage
export const loadStateFromLocalStorage = (): AppState | null => {
    try {
        // Check if state has expired (72 hours/3 days)
        const timestamp = localStorage.getItem('calendarAppStateTimestamp');
        const EXPIRATION_TIME = 72 * 60 * 60 * 1000; // 72 hours in milliseconds

        if (timestamp && Date.now() - parseInt(timestamp) > EXPIRATION_TIME) {
            // State has expired, clear it
            localStorage.removeItem('calendarAppState');
            localStorage.removeItem('calendarAppStateTimestamp');
            return null;
        }

        const stateStr = localStorage.getItem('calendarAppState');
        if (!stateStr) return null;

        return JSON.parse(stateStr);
    } catch (error) {
        console.error('Failed to load state from localStorage:', error);
        return null;
    }
};

// Clear stored state - can be used when user explicitly wants to reset
export const clearStoredState = (): void => {
    try {
        localStorage.removeItem('calendarAppState');
        localStorage.removeItem('calendarAppStateTimestamp');
    } catch (error) {
        console.error('Failed to clear state from localStorage:', error);
    }
};