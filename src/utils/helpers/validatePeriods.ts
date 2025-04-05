import { Period } from "@/types/Period";

export interface ValidationResult {
    isValid: boolean;
    errorMessage: string;
    errorIndex?: number;
    errorField?: "start" | "end";
}

export const isValidDate = (value: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    if (!regex.test(value)) return false;

    const [yearStr, monthStr, dayStr] = value.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

export const validatePeriods = (periods: Period[]): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errorMessage: ""
    };

    for (let i = 0; i < periods.length; i++) {
        const { start, end } = periods[i];

        if (start && !isValidDate(start)) {
            console.warn("Błędna data początkowa:", start);
            return {
                isValid: false,
                errorMessage: `Błędna data początkowa (Rok ${i + 1})`,
                errorIndex: i,
                errorField: "start"
            };
        }

        if (end && !isValidDate(end)) {
            console.warn("Błędna data końcowa:", end);
            return {
                isValid: false,
                errorMessage: `Błędna data końcowa (Rok ${i + 1})`,
                errorIndex: i,
                errorField: "end"
            };
        }

        if (!start || !end) continue;

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (startDate >= endDate) {
            return {
                isValid: false,
                errorMessage: `Błąd: Data początkowa musi być wcześniejsza niż końcowa (Rok ${i + 1})`,
                errorIndex: i,
                errorField: "end"
            };
        }

        for (let j = 0; j < i; j++) {
            if (!periods[j].start || !periods[j].end) continue;

            const iStart = new Date(start);
            const iEnd = new Date(end);
            const jStart = new Date(periods[j].start);
            const jEnd = new Date(periods[j].end);

            if (iStart <= jEnd && iEnd >= jStart) {
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
