import { describe, it, expect } from "vitest";
import { validatePeriods } from "@/utils/helpers/validatePeriods";
import type { Period } from "@/types/Period";

describe("validatePeriods", () => {
    it("returns valid for correct, non-overlapping periods", () => {
        const periods: Period[] = [
            { start: "2024-01-01", end: "2024-01-10" },
            { start: "2024-01-15", end: "2024-01-20" },
        ];
        const result = validatePeriods(periods);
        expect(result.isValid).toBe(true);
    });

    it("returns invalid for malformed start date", () => {
        const periods: Period[] = [
            { start: "invalid-date", end: "2024-01-10" },
        ];
        const result = validatePeriods(periods);
        expect(result.isValid).toBe(false);
        expect(result.errorField).toBe("start");
        expect(result.errorIndex).toBe(0);
    });

    it("returns invalid for malformed end date", () => {
        const periods: Period[] = [
            { start: "2024-01-01", end: "bad-end" },
        ];
        const result = validatePeriods(periods);
        expect(result.isValid).toBe(false);
        expect(result.errorField).toBe("end");
        expect(result.errorIndex).toBe(0);
    });

    it("returns invalid if start date is after end date", () => {
        const periods: Period[] = [
            { start: "2024-01-15", end: "2024-01-10" },
        ];
        const result = validatePeriods(periods);
        expect(result.isValid).toBe(false);
        expect(result.errorField).toBe("end");
        expect(result.errorIndex).toBe(0);
    });

    it("skips empty periods (no validation error)", () => {
        const periods: Period[] = [
            { start: "", end: "" },
            { start: "2024-01-01", end: "2024-01-10" },
        ];
        const result = validatePeriods(periods);
        expect(result.isValid).toBe(true);
    });

    it("returns invalid if periods overlap", () => {
        const periods: Period[] = [
            { start: "2024-01-01", end: "2024-01-10" },
            { start: "2024-01-08", end: "2024-01-15" },
        ];
        const result = validatePeriods(periods);
        expect(result.isValid).toBe(false);
        expect(result.errorIndex).toBe(1);
        expect(result.errorMessage).toMatch(/Okresy nie mogą się nakładać/);
    });

    it("returns invalid for multiple overlapping periods", () => {
        const periods: Period[] = [
            { start: "2024-01-01", end: "2024-01-10" },
            { start: "2024-01-05", end: "2024-01-15" },
            { start: "2024-01-20", end: "2024-01-25" },
        ];
        const result = validatePeriods(periods);
        expect(result.isValid).toBe(false);
        expect(result.errorIndex).toBe(1);
    });
});
