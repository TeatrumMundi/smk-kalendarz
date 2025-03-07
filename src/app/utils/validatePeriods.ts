import { Period } from "../types/Period";

export interface ValidationResult {
    isValid: boolean;
    errorMessage: string;
    errorIndex?: number;
    errorField?: "start" | "end";
}

export const validatePeriods = (periods: Period[]): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errorMessage: ""
    };

    for (let i = 0; i < periods.length; i++) {
        // Skip validation for empty periods
        if (!periods[i].start || !periods[i].end) continue;

        if (new Date(periods[i].start) >= new Date(periods[i].end)) {
            result.isValid = false;
            result.errorMessage = `Błąd: Data początkowa musi być wcześniejsza niż data końcowa (Rok ${i + 1})`;
            result.errorIndex = i;
            result.errorField = "end";
            return result;
        }

        for (let j = 0; j < i; j++) {
            // Skip validation if either period is incomplete
            if (!periods[i].start || !periods[i].end || !periods[j].start || !periods[j].end) continue;

            const iStart = new Date(periods[i].start);
            const iEnd = new Date(periods[i].end);
            const jStart = new Date(periods[j].start);
            const jEnd = new Date(periods[j].end);

            // Check for overlap
            if (iStart <= jEnd && iEnd >= jStart) {
                result.isValid = false;
                result.errorMessage = `Błąd: Okresy nie mogą się nakładać (Rok ${i + 1} i Rok ${j + 1})`;
                result.errorIndex = i;
                return result;
            }
        }
    }

    return result;
};