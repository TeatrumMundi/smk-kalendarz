import { describe, it, expect, vi } from "vitest";
import { getCalendarDaysInRange } from "@/utils/helpers/getCalendarDaysInRange";

describe("getCalendarDaysInRange", () => {
    it("returns correct number of days (inclusive)", () => {
        expect(getCalendarDaysInRange("2024-01-01", "2024-01-05")).toBe(5);
    });

    it("returns 1 for same start and end date", () => {
        expect(getCalendarDaysInRange("2024-01-03", "2024-01-03")).toBe(1);
    });

    it("works when dates are reversed (start > end)", () => {
        expect(getCalendarDaysInRange("2024-01-05", "2024-01-01")).toBe(5);
    });

    it("accepts DD.MM.YYYY format", () => {
        expect(getCalendarDaysInRange("01.01.2024", "03.01.2024")).toBe(3);
    });

    it("accepts DD/MM/YYYY format", () => {
        expect(getCalendarDaysInRange("01/01/2024", "03/01/2024")).toBe(3);
    });

    it("accepts Date objects", () => {
        expect(
            getCalendarDaysInRange(new Date("2024-01-01"), new Date("2024-01-04"))
        ).toBe(4);
    });

    it("returns 0 for invalid date strings", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(getCalendarDaysInRange("invalid", "2024-01-01")).toBe(0);
        expect(getCalendarDaysInRange("2024-01-01", "bad-date")).toBe(0);
        warn.mockRestore();
    });

    it("returns 0 for missing values", () => {
        expect(getCalendarDaysInRange("", "2024-01-01")).toBe(0);
        expect(getCalendarDaysInRange("2024-01-01", "")).toBe(0);
    });
});
