import { FC } from 'react';

interface PersonalInfoFormProps {
    personalInfo: {
        firstName: string;
        lastName: string;
    };
    handlePersonalInfoChange: (field: 'firstName' | 'lastName', value: string) => void;
}

const PersonalInfoForm: FC<PersonalInfoFormProps> = ({ personalInfo, handlePersonalInfoChange }) => {
    return (
        <div className="flex flex-wrap justify-center gap-4 p-4 w-full mb-6 bg-gray-800 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 p-2 rounded-lg w-full md:w-auto">
                <label className="font-medium text-sm">Imię:</label>
                <input
                    type="text"
                    value={personalInfo.firstName}
                    onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                    className="border p-2 text-sm rounded-lg w-40 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg w-full md:w-auto">
                <label className="font-medium text-sm">Nazwisko:</label>
                <input
                    type="text"
                    value={personalInfo.lastName}
                    onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                    className="border p-2 text-sm rounded-lg w-40 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>
        </div>
    );
};

export default PersonalInfoForm;
