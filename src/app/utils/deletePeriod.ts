import { Period } from "@/app/types/Period";

interface ColoredRange {
    start: string;
    end: string;
    type: string;
    color: string;
}

export const deletePeriod = (
    indexToDelete: number,
    periods: Period[],
    setPeriods: (periods: Period[]) => void,
    displayPeriods: { start: string; end: string }[],
    setDisplayPeriods: (displayPeriods: { start: string; end: string }[]) => void,
    coloredRanges: ColoredRange[],
    setColoredRanges: (ranges: ColoredRange[]) => void
) => {
    if (periods.length > 1) {
        const periodToDelete = periods[indexToDelete];

        if (periodToDelete?.start && periodToDelete?.end) {
            const periodYear = new Date(periodToDelete.start).getFullYear();
            const updatedRanges = coloredRanges.filter(range => {
                const rangeDate = range.start.split(/[\/.]/).pop();
                return rangeDate && parseInt(rangeDate) !== periodYear;
            });
            setColoredRanges(updatedRanges);
        }

        const newPeriods = [...periods];
        const newDisplayPeriods = [...displayPeriods];

        newPeriods.splice(indexToDelete, 1);
        newDisplayPeriods.splice(indexToDelete, 1);

        setPeriods(newPeriods);
        setDisplayPeriods(newDisplayPeriods);
    }
};
