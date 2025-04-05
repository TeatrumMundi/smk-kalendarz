"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ErrorPopupProps {
    message: string;
    show: boolean;
    onClose?: () => void; // opcjonalne wywołanie zamknięcia
}

export default function ErrorPopup({ message, show, onClose }: ErrorPopupProps) {
    useEffect(() => {
        if (!show || !onClose) return;
        const timeout = setTimeout(onClose, 5000);
        return () => clearTimeout(timeout);
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-15 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-sm shadow-sm border border-red-400 flex items-center gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-white" />
                    <span className="text-sm font-medium">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
