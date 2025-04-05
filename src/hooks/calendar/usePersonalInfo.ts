import { useState, useEffect } from "react";
import {PersonalInfo} from "@/types/Period";

/**
 * Manages personal information (e.g., name, title) with localStorage persistence.
 */
export const usePersonalInfo = () => {
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("personalInfo");
            return saved ? JSON.parse(saved) : { firstName: "", lastName: "" };
        }
        return { firstName: "", lastName: "" };
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("personalInfo", JSON.stringify(personalInfo));
        }
    }, [personalInfo]);

    const handlePersonalInfoChange = (key: keyof PersonalInfo, value: string) => {
        setPersonalInfo((prev) => ({ ...prev, [key]: value }));
    };

    return {
        personalInfo,
        setPersonalInfo,
        handlePersonalInfoChange,
    };
};
