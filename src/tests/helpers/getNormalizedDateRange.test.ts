import { describe, it, expect } from "vitest";
import { getNormalizedDateRange } from "@/utils/helpers/getNormalizedDateRange";

describe("getNormalizedDateRange", () => {
    it("returns ordered Date objects for valid strings", () => {
        const [start, end] = getNormalizedDateRange("2024-01-01", "2024-01-10")!;
        expect(start).toBeInstanceOf(Date);
        expect(end).toBeInstanceOf(Date);
        expect(start.getTime()).toBeLessThan(end.getTime());
    });

    it("swaps dates if start is after end", () => {
        const [start, end] = getNormalizedDateRange("2024-01-10", "2024-01-01")!;
        expect(start.getDate()).toBe(1);
        expect(end.getDate()).toBe(10);
    });

    it("returns null for invalid string input", () => {
        const result = getNormalizedDateRange("not-a-date", "2024-01-01");
        expect(result).toBeNull();
    });

    it("works with Date objects", () => {
        const result = getNormalizedDateRange(
            new Date("2024-01-01"),
            new Date("2024-01-05")
        );
        expect(result).not.toBeNull();
        const [start, end] = result!;
        expect(start.getTime()).toBeLessThan(end.getTime());
    });

    it("handles mixed string and Date inputs", () => {
        const result = getNormalizedDateRange("2024-01-01", new Date("2024-01-05"));
        expect(result).not.toBeNull();
        const [start, end] = result!;
        expect(start.getDate()).toBe(1);
        expect(end.getDate()).toBe(5);
    });

    it("returns null if any date is missing", () => {
        expect(getNormalizedDateRange("", "2024-01-01")).toBeNull();
        expect(getNormalizedDateRange("2024-01-01", "")).toBeNull();
    });
});
