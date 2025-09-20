import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  data: any[];
  columns: { header: string; dataKey: string; width?: number }[];
  filename: string;
  orientation?: 'portrait' | 'landscape';
  showDate?: boolean;
  footerText?: string;
}

export class PDFExporter {
  private doc: jsPDF;

  constructor(orientation: 'portrait' | 'landscape' = 'portrait') {
    this.doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });
  }

  private addHeader(title: string, subtitle?: string, showDate: boolean = true) {
    // Company header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(20);
    this.doc.text('FoodyFlow', 20, 25);
    
    this.doc.setFontSize(16);
    this.doc.text(title, 20, 35);
    
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, 20, 45);
    }
    
    if (showDate) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      this.doc.text(`Data generazione: ${currentDate}`, 20, subtitle ? 55 : 45);
    }

    // Add line separator
    const startY = subtitle ? 65 : 55;
    this.doc.setLineWidth(0.5);
    this.doc.line(20, startY, this.doc.internal.pageSize.width - 20, startY);
    
    return startY + 10;
  }

  private addFooter(footerText?: string) {
    const pageHeight = this.doc.internal.pageSize.height;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    
    if (footerText) {
      this.doc.text(footerText, 20, pageHeight - 15);
    }
    
    // Page number
    const pageNumber = `Pagina ${this.doc.getCurrentPageInfo().pageNumber}`;
    const pageWidth = this.doc.internal.pageSize.width;
    this.doc.text(pageNumber, pageWidth - 40, pageHeight - 10);
  }

  public exportTable(options: PDFExportOptions): void {
    const startY = this.addHeader(options.title, options.subtitle, options.showDate !== false);

    // Prepare table data
    const tableData = options.data.map(row => 
      options.columns.map(col => {
        const value = row[col.dataKey];
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') {
          return col.dataKey.includes('€') || col.dataKey.includes('euro') || col.dataKey.includes('costo') || col.dataKey.includes('prezzo') 
            ? `€${value.toFixed(1)}` 
            : value.toFixed(1);
        }
        return String(value);
      })
    );

    // Generate table
    this.doc.autoTable({
      head: [options.columns.map(col => col.header)],
      body: tableData,
      startY: startY,
      margin: { left: 20, right: 20 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: options.columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width };
        }
        return acc;
      }, {} as any),
      didDrawPage: () => {
        this.addFooter(options.footerText);
      },
    });

    // Save the PDF
    this.doc.save(options.filename);
  }

  public exportSummaryReport(options: {
    title: string;
    subtitle?: string;
    sections: {
      title: string;
      data: { label: string; value: string | number }[];
    }[];
    filename: string;
  }): void {
    const startY = this.addHeader(options.title, options.subtitle);
    let currentY = startY;

    options.sections.forEach((section, index) => {
      // Section title
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.text(section.title, 20, currentY);
      currentY += 10;

      // Section data
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      
      section.data.forEach(item => {
        const value = typeof item.value === 'number' 
          ? item.value.toFixed(1)
          : String(item.value);
        
        this.doc.text(`${item.label}:`, 25, currentY);
        this.doc.text(value, 80, currentY);
        currentY += 6;
      });

      currentY += 5; // Space between sections

      // Check if we need a new page
      if (currentY > this.doc.internal.pageSize.height - 40) {
        this.doc.addPage();
        currentY = 30;
      }
    });

    this.addFooter();
    this.doc.save(options.filename);
  }
}

// Helper function for quick table export
export function exportTableToPDF(options: PDFExportOptions): void {
  const exporter = new PDFExporter(options.orientation);
  exporter.exportTable(options);
}

// Helper function for summary report export
export function exportSummaryToPDF(options: {
  title: string;
  subtitle?: string;
  sections: {
    title: string;
    data: { label: string; value: string | number }[];
  }[];
  filename: string;
}): void {
  const exporter = new PDFExporter();
  exporter.exportSummaryReport(options);
}