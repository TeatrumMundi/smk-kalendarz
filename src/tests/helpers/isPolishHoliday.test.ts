import { describe, it, expect } from "vitest";
import { isPolishHoliday } from "@/utils/helpers/polishHolidays";

describe("isPolishHoliday - fixed holidays", () => {
    const fixedHolidays = [
        { date: "2024-01-01", name: "New Year's Day" },
        { date: "2024-01-06", name: "Epiphany (Three Kings)" },
        { date: "2024-05-01", name: "Labor Day" },
        { date: "2024-05-03", name: "Constitution Day" },
        { date: "2024-08-15", name: "Assumption of Mary" },
        { date: "2024-11-01", name: "All Saints" },
        { date: "2024-11-11", name: "Independence Day" },
        { date: "2024-12-25", name: "Christmas Day" },
        { date: "2024-12-26", name: "Second Christmas Day" },
    ];

    fixedHolidays.forEach(({ date, name }) => {
        it(`returns true for ${name} (${date})`, () => {
            expect(isPolishHoliday(new Date(date))).toBe(true);
        });
    });
});

describe("isPolishHoliday - movable holidays (2024)", () => {
    // Wielkanoc w 2024: 31 marca
    it("returns true for Easter Sunday (2024-03-31)", () => {
        expect(isPolishHoliday(new Date("2024-03-31"))).toBe(true);
    });

    it("returns true for Easter Monday (2024-04-01)", () => {
        expect(isPolishHoliday(new Date("2024-04-01"))).toBe(true);
    });

    it("returns true for Pentecost (2024-05-19)", () => {
        expect(isPolishHoliday(new Date("2024-05-19"))).toBe(true);
    });

    it("returns true for Corpus Christi (2024-05-30)", () => {
        expect(isPolishHoliday(new Date("2024-05-30"))).toBe(true);
    });
});

describe("isPolishHoliday - non-holidays", () => {
    it("returns false for a regular weekday (2024-01-02)", () => {
        expect(isPolishHoliday(new Date("2024-01-02"))).toBe(false);
    });

    it("returns false for a random non-holiday weekend", () => {
        expect(isPolishHoliday(new Date("2024-06-22"))).toBe(false); // Saturday
        expect(isPolishHoliday(new Date("2024-06-23"))).toBe(false); // Sunday
    });

    it("returns false for invalid dates (implicitly not a holiday)", () => {
        expect(isPolishHoliday(new Date("2024-07-15"))).toBe(false);
    });
});
