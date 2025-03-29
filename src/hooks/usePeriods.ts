import React, { useState, useEffect } from 'react';
import { Period, ColoredRange } from '@/types/Period';
import { ValidationResult } from '@/utils/helpers/validatePeriods';
import { deletePeriod } from '@/utils/actions/deletePeriod';
import { handleDisplayChange } from '@/utils/calendar/handleDisplayChange';

export const usePeriods = () => {
    const [periods, setPeriods] = useState<Period[]>(() => {
        if (typeof window !== 'undefined') {
            const savedPeriods = localStorage.getItem('periods');
            return savedPeriods ? JSON.parse(savedPeriods) : [{ start: "", end: "" }];
        }
        return [{ start: "", end: "" }];
    });

    const [displayPeriods, setDisplayPeriods] = useState<Array<{ start: string, end: string }>>(() => {
        if (typeof window !== 'undefined') {
            const savedDisplayPeriods = localStorage.getItem('displayPeriods');
            return savedDisplayPeriods ? JSON.parse(savedDisplayPeriods) : [{ start: "", end: "" }];
        }
        return [{ start: "", end: "" }];
    });

    const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errorMessage: "" });
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [validPeriods, setValidPeriods] = useState<Period[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('periods', JSON.stringify(periods));
        }
    }, [periods]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('displayPeriods', JSON.stringify(displayPeriods));
        }
    }, [displayPeriods]);

    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => setShowPopup(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showPopup]);

    useEffect(() => {
        const validOnes = periods.filter(period => period.start && period.end);
        setValidPeriods(validOnes);
    }, [periods]);

    const addNewPeriod = () => {
        setPeriods([...periods, { start: "", end: "" }]);
        setDisplayPeriods([...displayPeriods, { start: "", end: "" }]);
    };

    const handleDeletePeriod = (indexToDelete: number, coloredRanges: ColoredRange[], setColoredRanges: React.Dispatch<React.SetStateAction<ColoredRange[]>>) => {
        deletePeriod(indexToDelete, periods, setPeriods, displayPeriods, setDisplayPeriods, coloredRanges, setColoredRanges);
    };

    const handleDateChange = (index: number, field: "start" | "end", value: string): void => {
        if (value.length < displayPeriods[index][field].length) {
            handleDisplayChange(index, field, value, displayPeriods, setDisplayPeriods, periods, setPeriods, setValidationResult, setShowPopup);
            return;
        }

        const digitsOnly = value.replace(/\D/g, '');
        let formattedValue = '';

        if (digitsOnly.length > 0) {
            let days = digitsOnly.substring(0, 2);
            if (parseInt(days) > 31) days = '31';
            formattedValue = days;

            if (digitsOnly.length >= 2) {
                formattedValue += '/';
                if (digitsOnly.length > 2) {
                    let months = digitsOnly.substring(2, 4);
                    if (parseInt(months) > 12) months = '12';
                    formattedValue += months;

                    if (digitsOnly.length >= 4) {
                        formattedValue += '/';
                        if (digitsOnly.length > 4) {
                            const year = digitsOnly.substring(4, 8);
                            formattedValue += year;

                            if (field === "start" && year.length === 4) {
                                setTimeout(() => {
                                    const nextInput = document.querySelector(`input[placeholder="DD/MM/RRRR"][value="${displayPeriods[index].end}"]`);
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

        handleDisplayChange(index, field, formattedValue, displayPeriods, setDisplayPeriods, periods, setPeriods, setValidationResult, setShowPopup);
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
        handleDateChange
    };
};
