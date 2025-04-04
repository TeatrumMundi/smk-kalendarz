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
        <div className="flex flex-wrap justify-center gap-4 p-4 w-full mb-6 bg-gray-800 rounded-xs shadow-md">
            {/* First Name */}
            <div className="relative w-40">
                <input
                    type="text"
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                    className="peer block w-full px-2.5 pt-4 pb-1.5 text-sm bg-gray-700 text-white border rounded-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder=" "
                />
                <label
                    htmlFor="firstName"
                    className="absolute text-sm text-gray-400 duration-200 transform -translate-y-3 scale-75 top-2 left-2.5 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                    Imię
                </label>
            </div>

            {/* Last Name */}
            <div className="relative w-40">
                <input
                    type="text"
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                    className="peer block w-full px-2.5 pt-4 pb-1.5 text-sm bg-gray-700 text-white border rounded-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder=" "
                />
                <label
                    htmlFor="lastName"
                    className="absolute text-sm text-gray-400 duration-200 transform -translate-y-3 scale-75 top-2 left-2.5 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                    Nazwisko
                </label>
            </div>
        </div>
    );
};

export default PersonalInfoForm;
