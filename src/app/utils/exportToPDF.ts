import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportToPDF = async (personalInfo: { firstName: string, lastName: string }) => {
    try {
        // Find all calendar sections - assuming they are wrapped in divs with specific classes or ids
        const calendarSections = document.querySelectorAll('#calendar-container > div');

        if (!calendarSections || calendarSections.length === 0) {
            console.log('No calendar sections found');
            return;
        }

        console.log(`Found ${calendarSections.length} calendar sections to export`);

        // Create a new PDF with landscape orientation
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Convert each section to a PDF page
        for (let i = 0; i < calendarSections.length; i++) {
            const section = calendarSections[i];

            // Create a temporary container to hold our cloned content
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = section.scrollWidth + 'px';
            tempDiv.style.backgroundColor = '#ffffff';
            tempDiv.style.padding = '20px';

            // Clone the content
            tempDiv.innerHTML = section.innerHTML;
            document.body.appendChild(tempDiv);

            // Process all stylesheets to remove oklch colors
            const styleSheets = Array.from(document.styleSheets);
            for (const sheet of styleSheets) {
                try {
                    if (sheet.cssRules) {
                        for (let j = 0; j < sheet.cssRules.length; j++) {
                            const rule = sheet.cssRules[j];
                            if (rule instanceof CSSStyleRule) {
                                for (let k = 0; k < rule.style.length; k++) {
                                    const property = rule.style[k];
                                    const value = rule.style.getPropertyValue(property);
                                    if (value.includes('oklch')) {
                                        // Remove or replace the problematic oklch color function
                                        rule.style.setProperty(property, '#333333', 'important');
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Some stylesheets might be inaccessible due to CORS
                    console.log('Could not access stylesheet', e);
                }
            }

            // Apply direct styles to all elements with potentially problematic colors
            const applyColorFixes = (container: HTMLElement) => {
                // Fix all computed styles to remove any oklch colors
                const allElements = container.querySelectorAll('*');
                allElements.forEach((el) => {
                    if (el instanceof HTMLElement) {
                        const computedStyle = window.getComputedStyle(el);
                        for (const prop of ['color', 'background-color', 'border-color', 'outline-color', 'box-shadow']) {
                            const value = computedStyle.getPropertyValue(prop);
                            if (value.includes('oklch')) {
                                // Apply fallback color depending on the property
                                if (prop === 'color') {
                                    el.style.color = '#000000';
                                } else if (prop === 'background-color') {
                                    el.style.backgroundColor = '#ffffff';
                                }
                                // Other properties can be set as needed
                            }
                        }
                    }
                });

                // Fix background colors for Tailwind classes
                container.querySelectorAll('[class*="bg-"]').forEach((el) => {
                    if (el instanceof HTMLElement) {
                        // Apply safe colors for each Tailwind color class
                        if (el.className.includes('bg-red-500')) el.style.backgroundColor = '#ef4444';
                        else if (el.className.includes('bg-blue-500')) el.style.backgroundColor = '#3b82f6';
                        else if (el.className.includes('bg-cyan-400')) el.style.backgroundColor = '#22d3ee';
                        else if (el.className.includes('bg-emerald-400')) el.style.backgroundColor = '#34d399';
                        else if (el.className.includes('bg-amber-700')) el.style.backgroundColor = '#b45309';
                        else if (el.className.includes('bg-purple-500')) el.style.backgroundColor = '#a855f7';
                        else if (el.className.includes('bg-yellow-500')) el.style.backgroundColor = '#eab308';
                        else if (el.className.includes('bg-pink-400')) el.style.backgroundColor = '#f472b6';
                        else if (el.className.includes('bg-green-600')) el.style.backgroundColor = '#16a34a';
                        else if (el.className.includes('bg-red-900')) el.style.backgroundColor = '#7f1d1d';
                        else if (el.className.includes('bg-orange-900')) el.style.backgroundColor = '#7c2d12';
                        else if (el.className.includes('bg-gray-600')) el.style.backgroundColor = '#4b5563';
                        else if (el.className.includes('bg-gray-700')) el.style.backgroundColor = '#374151';
                        else if (el.className.includes('bg-gray-800')) el.style.backgroundColor = '#1f2937';
                        else if (el.className.includes('bg-gray-900')) el.style.backgroundColor = '#111827';
                    }
                });

                // Fix text colors
                container.querySelectorAll('[class*="text-"]').forEach((el) => {
                    if (el instanceof HTMLElement) {
                        if (el.className.includes('text-red-400')) el.style.color = '#f87171';
                        else if (el.className.includes('text-gray-400')) el.style.color = '#9ca3af';
                        else if (el.className.includes('text-gray-100')) el.style.color = '#f3f4f6';
                        else if (el.className.includes('text-white')) el.style.color = '#ffffff';
                    }
                });

                // Remove the export button from each section if it exists
                const exportButtons = container.querySelectorAll('button');
                exportButtons.forEach(button => {
                    if (button.textContent?.includes('PDF')) {
                        button.style.display = 'none';
                    }
                });
            };

            applyColorFixes(tempDiv);

            // Create the canvas from our fixed element
            const canvas = await html2canvas(tempDiv, {
                backgroundColor: '#ffffff',
                scale: 1.5,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // Additional processing on the cloned document
                    const elements = clonedDoc.querySelectorAll('*');
                    elements.forEach(el => {
                        if (el instanceof HTMLElement) {
                            // Force override any inline styles with oklch
                            const style = el.getAttribute('style');
                            if (style && style.includes('oklch')) {
                                el.setAttribute('style', style.replace(/oklch\([^)]+\)/g, '#333333'));
                            }
                        }
                    });
                }
            });

            // Clean up
            document.body.removeChild(tempDiv);

            // Add the page to the PDF
            if (i > 0) { // Add a new page for each section after the first
                pdf.addPage();
            }

            // Add the image to the PDF with proper scaling
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Show progress if many sections (optional)
            if (calendarSections.length > 3) {
                console.log(`Processed page ${i+1} of ${calendarSections.length}`);
            }
        }

        // Save the PDF with all pages
        pdf.save(`kalendarz-${personalInfo.firstName || 'user'}-${personalInfo.lastName || 'calendar'}.pdf`);
        console.log('PDF exported successfully with multiple pages');

    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
    }
};