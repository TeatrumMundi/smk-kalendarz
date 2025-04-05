import { Period } from "@/types/Period";

/**
 * Structure representing the result of validating a set of periods.
 */
export interface ValidationResult {
    isValid: boolean;
    errorMessage: string;
    errorIndex?: number;
    errorField?: "start" | "end";
}

/**
 * Validates whether a date string is in the correct YYYY-MM-DD format
 * and represents a valid calendar date (e.g., not 2024-02-30).
 *
 * @param value - The date string to validate
 * @returns {boolean} True if the date is valid, false otherwise
 */
export const isValidDate = (value: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/; // Expected format: YYYY-MM-DD
    if (!regex.test(value)) return false;

    const [yearStr, monthStr, dayStr] = value.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    const date = new Date(year, month - 1, day);

    // Ensure the parsed date matches exactly (prevents e.g., 2024-02-30 from passing)
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

/**
 * Validates an array of periods for correctness:
 * - Checks if dates are in valid format (YYYY-MM-DD)
 * - Checks if start is before end
 * - Checks if periods do not overlap
 *
 * @param periods - Array of Period objects to validate
 * @returns {ValidationResult} Object indicating if the data is valid, and error info if not
 */
export const validatePeriods = (periods: Period[]): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errorMessage: ""
    };

    for (let i = 0; i < periods.length; i++) {
        const { start, end } = periods[i];

        // Check start date validity
        if (start && !isValidDate(start)) {
            console.warn("Błędna data początkowa:", start);
            return {
                isValid: false,
                errorMessage: `Błędna data początkowa (Rok ${i + 1})`,
                errorIndex: i,
                errorField: "start"
            };
        }

        // Check end date validity
        if (end && !isValidDate(end)) {
            console.warn("Błędna data końcowa:", end);
            return {
                isValid: false,
                errorMessage: `Błędna data końcowa (Rok ${i + 1})`,
                errorIndex: i,
                errorField: "end"
            };
        }

        // Skip if one of the dates is missing
        if (!start || !end) continue;

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Ensure start < end
        if (startDate >= endDate) {
            return {
                isValid: false,
                errorMessage: `Błąd: Data początkowa musi być wcześniejsza niż końcowa (Rok ${i + 1})`,
                errorIndex: i,
                errorField: "end"
            };
        }

        // Check for overlaps with previously entered periods
        for (let j = 0; j < i; j++) {
            if (!periods[j].start || !periods[j].end) continue;

            const iStart = new Date(start);
            const iEnd = new Date(end);
            const jStart = new Date(periods[j].start);
            const jEnd = new Date(periods[j].end);

            const overlap = iStart <= jEnd && iEnd >= jStart;

            if (overlap) {
                return {
                    isValid: false,
                    errorMessage: `Błąd: Okresy nie mogą się nakładać (Rok ${i + 1} i Rok ${j + 1})`,
                    errorIndex: i
                };
            }
        }
    }

    return result;
};
