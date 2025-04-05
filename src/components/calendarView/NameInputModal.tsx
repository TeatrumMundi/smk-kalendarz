"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface NameInputModalProps {
    isOpen: boolean;
    start: Date;
    end: Date;
    onCloseAction: () => void;
    onSubmitAction: (label: string) => void;
}

const formatDate = (d: Date) =>
    d.toLocaleDateString("pl", { day: "2-digit", month: "2-digit", year: "numeric" });

export const NameInputModal: React.FC<NameInputModalProps> = ({
                                                                  isOpen,
                                                                  start,
                                                                  end,
                                                                  onCloseAction,
                                                                  onSubmitAction,
                                                              }) => {
    const [label, setLabel] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLabel("");
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        onSubmitAction(label.trim());
        onCloseAction();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCloseAction();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white text-gray-900 rounded-xs p-6 w-[90%] max-w-md shadow-xl"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h2 className="text-lg font-bold mb-2">Nazwa zakresu</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            {formatDate(start)} – {formatDate(end)}
                        </p>
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full border border-gray-300 p-2 rounded-xs mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Np. Staż ABC"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={onCloseAction}
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
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
