import { useState, useEffect } from 'react';

export const usePersonalInfo = () => {
    const [personalInfo, setPersonalInfo] = useState({
        firstName: typeof window !== 'undefined' ? localStorage.getItem('firstName') || "" : "",
        lastName: typeof window !== 'undefined' ? localStorage.getItem('lastName') || "" : ""
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('firstName', personalInfo.firstName);
            localStorage.setItem('lastName', personalInfo.lastName);
        }
    }, [personalInfo]);

    const handlePersonalInfoChange = (field: 'firstName' | 'lastName', value: string) => {
        setPersonalInfo(prev => ({ ...prev, [field]: value }));
    };

    return {
        personalInfo,
        setPersonalInfo,
        handlePersonalInfoChange
    };
};
