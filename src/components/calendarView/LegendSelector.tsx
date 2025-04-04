// @/components/calendarView/LegendSelector.tsx
'use client';

import React from "react";
import { legendItems } from "@/config/legendConfig";

interface LegendSelectorProps {
    selectedLegendType: string | null;
    setSelectedLegendTypeAction: React.Dispatch<React.SetStateAction<string | null>>;
}

export const LegendSelector = ({
                                   selectedLegendType,
                                   setSelectedLegendTypeAction
                               }: LegendSelectorProps) => {
    return (
        <div className="mt-4 flex flex-nowrap space-x-2 p-2 overflow-x-auto justify-center">
            {legendItems.map((item, index) => (
                <div
                    key={index}
                    className={`flex items-center whitespace-nowrap cursor-pointer p-2 rounded-xs transition-all bg-gray-700
                               ${selectedLegendType === item.label ? 'bg-indigo-600' : 'hover:bg-gray-600'}`}
                    onClick={() => setSelectedLegendTypeAction(selectedLegendType === item.label ? null : item.label)}
                >
                    <div className={`w-3 h-3 ${item.color} rounded-xs mr-2`}></div>
                    <span className="text-xs text-gray-100">{item.label}</span>
                </div>
            ))}
        </div>
    );
};
