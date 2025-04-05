import { describe, it, expect } from "vitest";
import {
    calculateRangeIndex,
    groupAndSummarizeRanges,
    formatStatsForClipboard,
} from "@/utils/helpers/calendarLogic";

describe("calculateRangeIndex", () => {
    it("returns null if date is before the range start", () => {
        const result = calculateRangeIndex(new Date("2024-01-01"), "02.01.2024");
        expect(result).toBeNull();
    });

    it("returns 1 for the same start date", () => {
        const result = calculateRangeIndex(new Date("2024-01-02"), "02.01.2024");
        expect(result).toBe(1);
    });

    it("counts only working days", () => {
        const result = calculateRangeIndex(new Date("2024-01-05"), "01.01.2024");
        // 1-5 stycznia: pon-pt → 5 dni roboczych
        expect(result).toBe(5);
    });

    it("skips weekends", () => {
        const result = calculateRangeIndex(new Date("2024-01-08"), "01.01.2024");
        // Poniedziałek po weekendzie → 6. dzień roboczy
        expect(result).toBe(6);
    });
});

describe("groupAndSummarizeRanges", () => {
    const baseRange = {
        start: "2024-01-01",
        end: "2024-01-10",
    };

    const coloredRanges = [
        {
            start: "2024-01-02",
            end: "2024-01-04",
            type: "Delegacja",
            color: "bg-blue-500",
            label: "Projekt X",
        },
        {
            start: "2024-01-06",
            end: "2024-01-08",
            type: "Chorobowe",
            color: "bg-red-500",
        },
        {
            start: "2023-12-01",
            end: "2023-12-15",
            type: "Old",
            color: "bg-gray-500",
        },
    ];

    it("filters ranges that intersect with the period", () => {
        const result = groupAndSummarizeRanges(coloredRanges, baseRange.start, baseRange.end);
        expect(result.totalWorkingDays).toBeGreaterThan(0);
        expect(result.grouped["Delegacja"]).toHaveLength(1);
        expect(result.grouped["Chorobowe"]).toHaveLength(1);
        expect(result.grouped["Old"]).toBeUndefined();
    });

    it("calculates correct colored and basic period days", () => {
        const result = groupAndSummarizeRanges(coloredRanges, baseRange.start, baseRange.end);
        const all = result.totalWorkingDays;
        const colored = result.coloredRangeDays;
        const basic = result.basicPeriodDays;

        expect(all).toBe(colored + basic);
    });
});

describe("formatStatsForClipboard", () => {
    const grouped = {
        Urlop: [
            {
                start: "02.01.2024",
                end: "04.01.2024",
                type: "Urlop",
                color: "bg-yellow-400",
                label: "Zima",
            },
        ],
        Szkolenie: [
            {
                start: "08.01.2024",
                end: "08.01.2024",
                type: "Szkolenie",
                color: "bg-green-400",
            },
        ],
    };

    it("returns multiline formatted summary", () => {
        const result = formatStatsForClipboard(grouped, 10, 4);

        expect(result).toMatch("Okres podstawowy ilość dni: 10 - 4 = 6");
        expect(result).toMatch("Urlop (Zima): 02.01.2024-04.01.2024 - 3 dni roboczych");
        expect(result).toMatch("Szkolenie: 08.01.2024 - 1 dni roboczych");
    });
});
