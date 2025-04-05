import React, { useState, useEffect } from "react";
import { Period, ColoredRange } from "@/types/Period";
import { ValidationResult } from "@/utils/helpers/validatePeriods";
import { deletePeriod } from "@/utils/actions/deletePeriod";
import { handleDisplayChange } from "@/utils/calendar/handleDisplayChange";

/**
 * usePeriods
 *
 * Manages all logic related to handling user-defined time periods (date ranges).
 * This includes:
 * - CRUD operations on periods
 * - Formatted input display vs. actual values
 * - Validation and popup feedback
 * - Persistent localStorage integration
 *
 * Useful for user-controlled period input in calendar views.
 *
 * @returns Object with periods state, validation result, and handler functions
 */
export const usePeriods = () => {
    /**
     * Holds the internal period objects (used for logic, not display)
     */
    const [periods, setPeriods] = useState<Period[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("periods");
            return saved ? JSON.parse(saved) : [{ start: "", end: "" }];
        }
        return [{ start: "", end: "" }];
    });

    /**
     * Stores how the user currently sees the input (e.g., with separators like "/")
     */
    const [displayPeriods, setDisplayPeriods] = useState<Array<{ start: string; end: string }>>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("displayPeriods");
            return saved ? JSON.parse(saved) : [{ start: "", end: "" }];
        }
        return [{ start: "", end: "" }];
    });

    // Validation result and popup visibility
    const [validationResult, setValidationResult] = useState<ValidationResult>({
        isValid: true,
        errorMessage: "",
    });

    const [showPopup, setShowPopup] = useState<boolean>(false);

    /**
     * Stores only valid (fully filled) periods
     */
    const [validPeriods, setValidPeriods] = useState<Period[]>([]);

    // Persist to localStorage when periods change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("periods", JSON.stringify(periods));
        }
    }, [periods]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("displayPeriods", JSON.stringify(displayPeriods));
        }
    }, [displayPeriods]);

    // Auto-close error popup after 3 seconds
    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => setShowPopup(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showPopup]);

    // Filter out only complete and valid periods
    useEffect(() => {
        const valid = periods.filter((p) => p.start && p.end);
        setValidPeriods(valid);
    }, [periods]);

    /**
     * Adds a new empty period to the list (both logic and display)
     */
    const addNewPeriod = () => {
        setPeriods([...periods, { start: "", end: "" }]);
        setDisplayPeriods([...displayPeriods, { start: "", end: "" }]);
    };

    /**
     * Deletes a specific period and clears its associated colored ranges
     */
    const handleDeletePeriod = (
        indexToDelete: number,
        coloredRanges: ColoredRange[],
        setColoredRanges: React.Dispatch<React.SetStateAction<ColoredRange[]>>
    ) => {
        deletePeriod(
            indexToDelete,
            periods,
            setPeriods,
            displayPeriods,
            setDisplayPeriods,
            coloredRanges,
            setColoredRanges
        );
    };

    /**
     * Handles change of a single date field (start or end),
     * formats it progressively (e.g., 01/04/2025) and updates both logical and visible state.
     */
    const handleDateChange = (
        index: number,
        field: "start" | "end",
        value: string
    ): void => {
        const oldValue = displayPeriods[index][field];

        // If a user is deleting characters, skip formatting
        if (value.length < oldValue.length) {
            handleDisplayChange(
                index,
                field,
                value,
                displayPeriods,
                setDisplayPeriods,
                periods,
                setPeriods,
                setValidationResult,
                setShowPopup
            );
            return;
        }

        // Otherwise, format the value based on digit input
        const digitsOnly = value.replace(/\D/g, "");
        let formattedValue = "";

        if (digitsOnly.length > 0) {
            let day = digitsOnly.substring(0, 2);
            if (parseInt(day) > 31) day = "31";
            formattedValue = day;

            if (digitsOnly.length >= 2) {
                formattedValue += "/";
                if (digitsOnly.length > 2) {
                    let month = digitsOnly.substring(2, 4);
                    if (parseInt(month) > 12) month = "12";
                    formattedValue += month;

                    if (digitsOnly.length >= 4) {
                        formattedValue += "/";
                        if (digitsOnly.length > 4) {
                            const year = digitsOnly.substring(4, 8);
                            formattedValue += year;

                            // Automatically move focus to next field after full date is typed
                            if (field === "start" && year.length === 4) {
                                setTimeout(() => {
                                    const nextInput = document.querySelector(
                                        `input[placeholder="DD/MM/RRRR"][value="${displayPeriods[index].end}"]`
                                    );
                                    if (nextInput instanceof HTMLInputElement) {
                                        nextInput.focus();
                                    }
                                }, 0);
                            }
                        }
                    }
                }
            }
        }

        handleDisplayChange(
            index,
            field,
            formattedValue,
            displayPeriods,
            setDisplayPeriods,
            periods,
            setPeriods,
            setValidationResult,
            setShowPopup
        );
    };

    return {
        periods,
        setPeriods,
        displayPeriods,
        setDisplayPeriods,
        validationResult,
        showPopup,
        setShowPopup,
        validPeriods,
        addNewPeriod,
        handleDeletePeriod,
        handleDateChange,
    };
};
