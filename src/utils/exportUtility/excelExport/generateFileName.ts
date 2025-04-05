export const generateFileName = (personalInfo: { firstName: string; lastName: string }) => {
    const sanitizedFirstName = (personalInfo.firstName || 'user').replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedLastName = (personalInfo.lastName || 'report').replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    return `${sanitizedFirstName}_${sanitizedLastName}_SMK_${timestamp}.xlsx`;
};
