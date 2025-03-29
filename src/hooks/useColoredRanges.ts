import { useState, useEffect } from 'react';
import { ColoredRange } from '@/types/Period';
import { isDateInRange } from '@/utils/helpers/dateHelpers';

export const useColoredRanges = () => {
    const [coloredRanges, setColoredRanges] = useState<ColoredRange[]>(() => {
        if (typeof window !== 'undefined') {
            const savedColoredRanges = localStorage.getItem('coloredRanges');
            return savedColoredRanges ? JSON.parse(savedColoredRanges) : [];
        }
        return [];
    });

    const [selectedLegendType, setSelectedLegendType] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const savedLegendType = localStorage.getItem('selectedLegendType');
            return savedLegendType ? JSON.parse(savedLegendType) : null;
        }
        return null;
    });

    const [rangeSelection, setRangeSelection] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('coloredRanges', JSON.stringify(coloredRanges));
        }
    }, [coloredRanges]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedLegendType', JSON.stringify(selectedLegendType));
        }
    }, [selectedLegendType]);

    const isDateInColoredRange = (date: Date, month: number, year: number) => {
        // First check if the date is in the correct month and year
        if (date.getMonth() !== month || date.getFullYear() !== year) return null;

        // Then check if it falls within any of the colored ranges
        const matchingRanges = coloredRanges.filter(range => isDateInRange(date, range));
        return matchingRanges.length > 0 ? matchingRanges[matchingRanges.length - 1] : null;
    };

    return {
        coloredRanges,
        setColoredRanges,
        selectedLegendType,
        setSelectedLegendType,
        rangeSelection,
        setRangeSelection,
        isDateInColoredRange
    };
};
