interface LegendItemProps {
    color: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

export const LegendItem = ({ color, label, isSelected, onClick }: LegendItemProps) => (
    <div
        className={`flex items-center whitespace-nowrap cursor-pointer p-2 rounded-lg transition-all duration-200 ${
            isSelected ? 'bg-gray-700 shadow-md' : 'bg-gray-800 hover:bg-gray-700 hover:shadow-md'
        }`}
        onClick={onClick}
    >
        <div className={`w-4 h-4 rounded-full mr-2 shadow-sm`} style={{ backgroundColor: color }}></div>
        <span className="text-sm font-medium text-gray-100">{label}</span>
    </div>
);