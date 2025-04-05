import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createLoadingOverlay, removeExistingOverlays } from "@/utils/animations/loadingOverlay";

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    position?: string;  // Optional additional fields
    department?: string;
    employeeId?: string;
}

export const exportToPDF = async (personalInfo: PersonalInfo) => {
    try {
        // Create loading overlay
        const loading = createLoadingOverlay({
            message: 'Generowanie PDF...'
        });

        // Find all calendar sections
        const calendarSections = document.querySelectorAll('#calendar-container > div');

        if (!calendarSections || calendarSections.length === 0) {
            loading.close();
            alert('Nie znaleziono danych do wyeksportowania');
            return;
        }

        // Create a new PDF with landscape orientation
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Add metadata to the PDF
        pdf.setProperties({
            title: `Kalendarz SMK - ${personalInfo.firstName} ${personalInfo.lastName}`,
            subject: 'Kalendarz SMK',
            author: 'System SMK',
            creator: 'SMK PDF Generator'
        });

        // Define fonts and colors for document consistency
        pdf.setDrawColor(200, 200, 200);

        // Set optimal scale based on screen resolution
        const scale = window.devicePixelRatio > 1 ? 2 : 1.5;

        // Helper function to fix colors
        const fixColors = (container: HTMLElement) => {
            // Create a mapping for tailwind classes to safe colors
            const colorMap: Record<string, string> = {
                'bg-red-500': '#ef4444',
                'bg-blue-500': '#3b82f6',
                'bg-cyan-400': '#22d3ee',
                'bg-emerald-400': '#34d399',
                'bg-amber-700': '#b45309',
                'bg-purple-500': '#a855f7',
                'bg-yellow-500': '#eab308',
                'bg-pink-400': '#f472b6',
                'bg-green-600': '#16a34a',
                'bg-red-900': '#7f1d1d',
                'bg-orange-900': '#7c2d12',
                'bg-gray-600': '#4b5563',
                'bg-gray-700': '#374151',
                'bg-gray-800': '#1f2937',
                'bg-gray-900': '#111827',
                'text-red-400': '#f87171',
                'text-gray-400': '#9ca3af',
                'text-gray-300': '#ffffff',
                'text-blue-400': '#ffffff',
                'text-gray-100': '#ffffff',
                'text-white': '#ffffff'
            };

            // Apply color fixes dynamically by checking for class prefix
            container.querySelectorAll('*').forEach(el => {
                if (el instanceof HTMLElement) {
                    // Fix computed styles with oklch
                    const style = getComputedStyle(el);
                    ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
                        const value = style[prop as keyof CSSStyleDeclaration] as string;
                        if (value && value.includes('oklch')) {
                            // Fix: Use type assertion for the property
                            if (prop === 'color') {
                                el.style.color = '#000000';
                            } else if (prop === 'backgroundColor') {
                                el.style.backgroundColor = '#ffffff';
                            } else if (prop === 'borderColor') {
                                el.style.borderColor = '#ffffff';
                            }
                        }
                    });

                    // Apply color map fixes based on classes
                    if (el.className) {
                        Object.entries(colorMap).forEach(([className, color]) => {
                            if (el.className.includes(className)) {
                                if (className.startsWith('bg-')) {
                                    el.style.backgroundColor = color;
                                } else if (className.startsWith('text-')) {
                                    el.style.color = color;
                                }
                            }
                        });
                    }
                }
            });

            // Remove buttons and UI elements not needed in PDF
            container.querySelectorAll('button').forEach(button => {
                if (button.textContent?.includes('PDF') ||
                    button.textContent?.includes('Reset') ||
                    button.textContent?.includes('Kopiuj') ||
                    button.className.includes('fixed')) {
                    button.style.display = 'none';
                }
            });
        };

        // Process each section
        for (let i = 0; i < calendarSections.length; i++) {
            loading.updateProgress((i / calendarSections.length) * 90); // Update progress (saving last 10% for final processing)

            const section = calendarSections[i];

            // Create a temporary container with a white background
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = section.scrollWidth + 'px';
            tempDiv.style.backgroundColor = '#000000';
            tempDiv.style.padding = '20px';
            tempDiv.style.color = '#000000';

            // Clone content
            tempDiv.innerHTML = section.innerHTML;
            document.body.appendChild(tempDiv);

            // Apply color fixes
            fixColors(tempDiv);

            // Generate canvas
            const canvas = await html2canvas(tempDiv, {
                backgroundColor: '#ffffff',
                scale: scale,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    const elements = clonedDoc.querySelectorAll('*');
                    elements.forEach(el => {
                        if (el instanceof HTMLElement) {
                            // Force to override any inline styles with oklch
                            const style = el.getAttribute('style');
                            if (style && style.includes('oklch')) {
                                el.setAttribute('style', style.replace(/oklch\([^)]+\)/g, '#333333'));
                            }
                        }
                    });
                }
            });

            // Clean up a temp element
            document.body.removeChild(tempDiv);

            // Add new page if not first page
            if (i > 0) {
                pdf.addPage();
            }

            // Add marginTop
            const marginTop = 0;

            // Calculate content area (accounting for header)
            const contentAreaHeight = pdfHeight - marginTop;
            const contentY = marginTop;

            // Add image with proper scaling to fit below header
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Scale image to fit available height if needed
            let finalImgWidth = imgWidth;
            let finalImgHeight = imgHeight;

            if (imgHeight > contentAreaHeight) {
                finalImgHeight = contentAreaHeight;
                finalImgWidth = (canvas.width * finalImgHeight) / canvas.height;
            }

            // Center image horizontally if it's smaller than page width
            const xOffset = finalImgWidth < pdfWidth ? (pdfWidth - finalImgWidth) / 2 : 0;

            pdf.addImage(imgData, 'PNG', xOffset, contentY, finalImgWidth, finalImgHeight);
        }

        loading.updateProgress(95); // Almost done

        // Save PDF with proper filename
        const sanitizedFirstName = (personalInfo.firstName || 'user').replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedLastName = (personalInfo.lastName || 'calendar').replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

        pdf.save(`${sanitizedFirstName}_${sanitizedLastName}_SMK_${timestamp}.pdf`);

        // Clean up and finish
        loading.updateProgress(100);
        setTimeout(() => {
            loading.close();
        }, 500);

        console.log('PDF exported successfully with multiple pages');
    } catch (error) {
        console.error('PDF generation error:', error);
        removeExistingOverlays();
        alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
    }
};