import { describe, it, expect, vi } from "vitest";
import { getWorkingDaysInRange } from "@/utils/helpers/getWorkingDaysInRange";
import * as holidays from "@/utils/helpers/polishHolidays";

vi.spyOn(holidays, "isPolishHoliday").mockImplementation((date) => {
    const d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear();
    return d === 2 && m === 1 && y === 2024;
});

describe("getWorkingDaysInRange", () => {
    it("returns correct number of working days (no weekends, no holidays)", () => {
        // 5 dni roboczych (Pn-Pt)
        expect(getWorkingDaysInRange("01.01.2024", "05.01.2024")).toBe(4); // 1 stycznia to poniedziałek i święto (Nowy Rok)
    });

    it("skips weekends", () => {
        // 1-7 stycznia 2024 = 5 dni roboczych
        expect(getWorkingDaysInRange("2024-01-01", "2024-01-07")).toBe(4);
    });

    it("skips mocked holiday (2024-01-02)", () => {
        // 2 stycznia to wtorek →, ale jako święto → nie wlicza się
        expect(getWorkingDaysInRange("2024-01-01", "2024-01-02")).toBe(1);
    });

    it("handles single-day range", () => {
        expect(getWorkingDaysInRange("03.01.2024", "03.01.2024")).toBe(1);
    });

    it("returns 0 for weekend-only range", () => {
        expect(getWorkingDaysInRange("06.01.2024", "07.01.2024")).toBe(0);
    });

    it("returns 0 for invalid date", () => {
        expect(getWorkingDaysInRange("not-a-date", "2024-01-07")).toBe(0);
    });

    it("returns 0 when start is after end", () => {
        expect(getWorkingDaysInRange("10.01.2024", "05.01.2024")).toBe(0);
    });

    it("accepts DD/MM/YYYY format", () => {
        expect(getWorkingDaysInRange("01/01/2024", "02/01/2024")).toBe(1);
    });
});
