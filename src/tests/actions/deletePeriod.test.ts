import { describe, it, expect, vi } from "vitest";
import { deletePeriod } from "@/utils/actions/deletePeriod";
import { Period, ColoredRange } from "@/types/Period";

describe("deletePeriod", () => {
    const basePeriods: Period[] = [
        { start: "2024-01-01", end: "2024-01-10" },
        { start: "2025-01-01", end: "2025-01-10" },
    ];

    const displayPeriods = [
        { start: "01/01/2024", end: "10/01/2024" },
        { start: "01/01/2025", end: "10/01/2025" },
    ];

    const coloredRanges: ColoredRange[] = [
        { start: "01/01/2024", end: "05/01/2024", type: "Work", color: "bg-blue-500" },
        { start: "02/02/2025", end: "05/02/2025", type: "Holiday", color: "bg-green-500" },
    ];

    it("removes the selected period and updates coloredRanges for that year", () => {
        const mockSetPeriods = vi.fn();
        const mockSetDisplayPeriods = vi.fn();
        const mockSetColoredRanges = vi.fn();

        deletePeriod(
            0,
            basePeriods,
            mockSetPeriods,
            displayPeriods,
            mockSetDisplayPeriods,
            coloredRanges,
            mockSetColoredRanges
        );

        // ✅ should remove first period
        expect(mockSetPeriods).toHaveBeenCalledWith([
            { start: "2025-01-01", end: "2025-01-10" },
        ]);

        expect(mockSetDisplayPeriods).toHaveBeenCalledWith([
            { start: "01/01/2025", end: "10/01/2025" },
        ]);

        // ✅ should remove only 2024 range
        expect(mockSetColoredRanges).toHaveBeenCalledWith([
            { start: "02/02/2025", end: "05/02/2025", type: "Holiday", color: "bg-green-500" },
        ]);
    });

    it("does nothing if only one period remains", () => {
        const mockSetPeriods = vi.fn();
        const mockSetDisplayPeriods = vi.fn();
        const mockSetColoredRanges = vi.fn();

        deletePeriod(
            0,
            [{ start: "2024-01-01", end: "2024-01-10" }],
            mockSetPeriods,
            [{ start: "01/01/2024", end: "10/01/2024" }],
            mockSetDisplayPeriods,
            coloredRanges,
            mockSetColoredRanges
        );

        expect(mockSetPeriods).not.toHaveBeenCalled();
        expect(mockSetDisplayPeriods).not.toHaveBeenCalled();
        expect(mockSetColoredRanges).not.toHaveBeenCalled();
    });

    it("does nothing if index is out of range", () => {
        const mockSetPeriods = vi.fn();
        const mockSetDisplayPeriods = vi.fn();
        const mockSetColoredRanges = vi.fn();

        deletePeriod(
            5,
            basePeriods,
            mockSetPeriods,
            displayPeriods,
            mockSetDisplayPeriods,
            coloredRanges,
            mockSetColoredRanges
        );

        expect(mockSetPeriods).not.toHaveBeenCalled();
        expect(mockSetDisplayPeriods).not.toHaveBeenCalled();
        expect(mockSetColoredRanges).not.toHaveBeenCalled();
    });

    it("removes period but does NOT update coloredRanges if period is incomplete", () => {
        const mockSetPeriods = vi.fn();
        const mockSetDisplayPeriods = vi.fn();
        const mockSetColoredRanges = vi.fn();

        const partialPeriods = [
            { start: "", end: "" },
            { start: "2025-01-01", end: "2025-01-10" },
        ];

        const partialDisplays = [
            { start: "", end: "" },
            { start: "01/01/2025", end: "10/01/2025" },
        ];

        deletePeriod(
            0,
            partialPeriods,
            mockSetPeriods,
            partialDisplays,
            mockSetDisplayPeriods,
            coloredRanges,
            mockSetColoredRanges
        );

        expect(mockSetPeriods).toHaveBeenCalledWith([
            { start: "2025-01-01", end: "2025-01-10" },
        ]);

        expect(mockSetDisplayPeriods).toHaveBeenCalledWith([
            { start: "01/01/2025", end: "10/01/2025" },
        ]);

        expect(mockSetColoredRanges).not.toHaveBeenCalled();
    });
});
