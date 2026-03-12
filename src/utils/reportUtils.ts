import jsPDF from 'jspdf';

export interface BrandingOptions {
    title: string;
    subtitle?: string;
    accentColor?: [number, number, number];
    confidential?: boolean;
}

export const reportUtils = {
    /**
     * Applies consistent professional branding to a jsPDF document
     */
    applyProfessionalBranding(doc: jsPDF, options: BrandingOptions) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const accentColor = options.accentColor || [30, 64, 175]; // Default Maritime Blue

        // 1. Header Frame
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(0, 0, pageWidth, 35, 'F');

        // 2. Title and Subtitle
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(options.title.toUpperCase(), 14, 20);

        if (options.subtitle) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(options.subtitle, 14, 28);
        }

        // 3. Metadata Header (Right Side)
        doc.setFontSize(8);
        doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 14, 15, { align: 'right' });
        doc.text(`REF: ${Math.random().toString(36).substring(7).toUpperCase()}`, pageWidth - 14, 22, { align: 'right' });

        if (options.confidential) {
            doc.setTextColor(255, 100, 100);
            doc.setFontSize(7);
            doc.text('CLASSIFIED / PROPRIETARY', pageWidth - 14, 29, { align: 'right' });
        }

        // 4. Footer Frame
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Footer Line
            doc.setDrawColor(200, 200, 200);
            doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);

            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.setFont('helvetica', 'normal');

            // Left - App Name
            doc.text('EAGLE VESSELS COMPLIANCE ENGINE v4.2', 14, pageHeight - 12);

            // Center - Confidentiality Note
            if (options.confidential) {
                doc.text('STRICTLY CONFIDENTIAL - AUTHORIZED ACCESS ONLY', pageWidth / 2, pageHeight - 12, { align: 'center' });
            }

            // Right - Page Numbering
            doc.text(`PAGE ${i} OF ${pageCount}`, pageWidth - 14, pageHeight - 12, { align: 'right' });
        }
    },

    /**
     * Adds a section header
     */
    addSectionHeader(doc: jsPDF, title: string, y: number) {
        doc.setFontSize(14);
        doc.setTextColor(30, 64, 175);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), 14, y);

        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.5);
        doc.line(14, y + 2, 40, y + 2);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        return y + 10;
    }
};
