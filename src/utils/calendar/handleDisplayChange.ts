import { Period } from "@/types/Period";
import { validatePeriods, ValidationResult } from "@/utils/helpers/validatePeriods";

export const handleDisplayChange = (
    index: number,
    field: "start" | "end",
    value: string,
    displayPeriods: Array<{start: string, end: string}>,
    setDisplayPeriods: (periods: Array<{start: string, end: string}>) => void,
    periods: Period[],
    setPeriods: (periods: Period[]) => void,
    setValidationResult: (result: ValidationResult) => void,
    setShowPopup: (show: boolean) => void
): void => {
    const newDisplayPeriods = [...displayPeriods];
    newDisplayPeriods[index][field] = value.replace(/[^0-9/]/g, '');
    setDisplayPeriods(newDisplayPeriods);

    try {
        const newPeriods = [...periods];

        if (value && value.includes('/') && value.split('/').length === 3) {
            try {
                const [day, month, year] = value.split('/');
                if (day && month && year && year.length === 4) {
                    const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`));
                    if (!isValidDate) {
                        return;
                    }
                    newPeriods[index][field as keyof Period] = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
            } catch (error) {
                console.error("Date parsing error:", error);
                setValidationResult({
                    isValid: false,
                    errorMessage: "Nieprawidłowy format daty"
                });
            }
        } else if (!value) {
            newPeriods[index][field as keyof Period] = "";
        }

        setPeriods(newPeriods);

        const result = validatePeriods(newPeriods);
        setValidationResult(result);

        if (!result.isValid) {
            setShowPopup(true);

            if (result.errorIndex !== undefined) {
                if (result.errorField) {
                    newDisplayPeriods[result.errorIndex][result.errorField as keyof typeof newDisplayPeriods[number]] = "";
                    newPeriods[result.errorIndex][result.errorField as keyof Period] = "";
                } else {
                    newDisplayPeriods[result.errorIndex] = { start: "", end: "" };
                    newPeriods[result.errorIndex] = { start: "", end: "" };
                }
                setDisplayPeriods(newDisplayPeriods);
                setPeriods(newPeriods);
            }
        }
    } catch (error) {
        console.log("Invalid date format", error);
    }
};
