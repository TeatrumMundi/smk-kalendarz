export const legendItems = [
    { color: 'bg-red-500', label: 'Urlop' },
    { color: 'bg-blue-500', label: 'Staże' },
    { color: 'bg-cyan-400', label: 'Kursy' },
    { color: 'bg-emerald-400', label: 'Samokształcenie' },
    { color: 'bg-amber-700', label: 'L4' },
    { color: 'bg-purple-500', label: 'Opieka nad dzieckiem' },
    { color: 'bg-yellow-500', label: 'Kwarantanna' },
    { color: 'bg-pink-400', label: 'Urlop macierzyński' },
    { color: 'bg-green-600', label: 'Urlop wychowawczy' }
];

// You can also define a type for the legend items
export interface LegendItem {
    color: string;
    label: string;
}
