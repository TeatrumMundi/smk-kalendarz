import { describe, it, expect } from "vitest";
import { parseDateString, isSameDate, isDateInRange } from "@/utils/helpers/dateHelpers";

describe("parseDateString", () => {
    it("parses YYYY-MM-DD correctly", () => {
        const date = parseDateString("2024-01-15");
        expect(date).toBeInstanceOf(Date);
        expect(date.getFullYear()).toBe(2024);
        expect(date.getMonth()).toBe(0); // January
        expect(date.getDate()).toBe(15);
    });

    it("parses DD/MM/YYYY correctly", () => {
        const date = parseDateString("15/01/2024");
        expect(date.getFullYear()).toBe(2024);
        expect(date.getMonth()).toBe(0);
        expect(date.getDate()).toBe(15);
    });

    it("parses DD.MM.YYYY correctly", () => {
        const date = parseDateString("15.01.2024");
        expect(date.getFullYear()).toBe(2024);
        expect(date.getMonth()).toBe(0);
        expect(date.getDate()).toBe(15);
    });

    it("handles invalid values gracefully (NaN)", () => {
        const date = parseDateString("invalid-date");
        expect(isNaN(date.getTime())).toBe(true);
    });
});

describe("isSameDate", () => {
    it("returns true for identical dates", () => {
        const a = new Date("2024-01-01");
        const b = new Date("2024-01-01");
        expect(isSameDate(a, b)).toBe(true);
    });

    it("returns false for different days", () => {
        const a = new Date("2024-01-01");
        const b = new Date("2024-01-02");
        expect(isSameDate(a, b)).toBe(false);
    });

    it("ignores time differences", () => {
        const a = new Date("2024-01-01T00:00:00");
        const b = new Date("2024-01-01T23:59:59");
        expect(isSameDate(a, b)).toBe(true);
    });
});

describe("isDateInRange", () => {
    const range = {
        start: "01/01/2024",
        end: "10/01/2024"
    };

    it("returns true for date inside range", () => {
        expect(isDateInRange(new Date("2024-01-05"), range)).toBe(true);
    });

    it("returns true for start boundary", () => {
        expect(isDateInRange(new Date("2024-01-01"), range)).toBe(true);
    });

    it("returns true for end boundary", () => {
        expect(isDateInRange(new Date("2024-01-10"), range)).toBe(true);
    });

    it("returns false for date before range", () => {
        expect(isDateInRange(new Date("2023-12-31"), range)).toBe(false);
    });

    it("returns false for date after range", () => {
        expect(isDateInRange(new Date("2024-01-11"), range)).toBe(false);
    });

    it("handles DD.MM.YYYY range format", () => {
        const dotRange = {
            start: "01.01.2024",
            end: "10.01.2024"
        };
        expect(isDateInRange(new Date("2024-01-05"), dotRange)).toBe(true);
    });

    it("returns false if range dates are invalid", () => {
        const invalidRange = {
            start: "not-a-date",
            end: "2024-01-10"
        };
        expect(isDateInRange(new Date("2024-01-05"), invalidRange)).toBe(false);
    });
});
