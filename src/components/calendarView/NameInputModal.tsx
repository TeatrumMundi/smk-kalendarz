import React, { useState, useEffect } from "react";

interface NameInputModalProps {
    isOpen: boolean;
    start: Date;
    end: Date;
    onClose: () => void;
    onSubmit: (label: string) => void;
}

const formatDate = (d: Date) =>
    d.toLocaleDateString("pl", { day: "2-digit", month: "2-digit", year: "numeric" });

export const NameInputModal: React.FC<NameInputModalProps> = ({
                                                                  isOpen,
                                                                  start,
                                                                  end,
                                                                  onClose,
                                                                  onSubmit,
                                                              }) => {
    const [label, setLabel] = useState("");

    useEffect(() => {
        if (isOpen) setLabel("");
    }, [isOpen]);

    const handleSubmit = () => {
        onSubmit(label.trim());
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white text-gray-900 rounded-xs p-6 w-[90%] max-w-md shadow-xl">
                <h2 className="text-lg font-bold mb-2">Nazwa zakresu</h2>
                <p className="text-sm text-gray-600 mb-4">
                    {formatDate(start)} – {formatDate(end)}
                </p>
                <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded-xs mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Np. Go KYS"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="text-sm px-3 py-1 rounded-xs hover:bg-gray-100"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="text-sm px-4 py-1 bg-indigo-600 text-white rounded-xs hover:bg-indigo-700"
                    >
                        Zapisz
                    </button>
                </div>
            </div>
        </div>
    );
};
