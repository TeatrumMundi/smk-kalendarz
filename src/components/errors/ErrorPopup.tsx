interface ErrorPopupProps {
    message: string;
    show: boolean;
}

export default function ErrorPopup({ message, show }: ErrorPopupProps) {
    if (!show) return null;

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-50 border-l-4 border-red-500 text-red-900 p-4 rounded-lg shadow-xl z-50 animate-fade-in">
            <div className="flex items-center">
                <svg
                    className="w-6 h-6 mr-3 text-red-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <span className="font-medium text-sm">{message}</span>
            </div>
        </div>
    );
}