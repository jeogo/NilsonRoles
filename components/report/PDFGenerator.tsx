import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = async (element: HTMLElement, websiteUrl: string) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    hotfixes: ['px_scaling']
  });

  try {
    // Prepare canvas options for better quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      foreignObjectRendering: true,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (doc) => {
        const el = doc.getElementById('report-content');
        if (el) {
          // Optimize for PDF
          el.style.padding = '20px';
          el.style.background = '#ffffff';
          // Remove interactive elements
          el.querySelectorAll('button, .MuiTooltip-root').forEach(node => node.remove());
        }
      }
    });

    // Set up PDF metadata
    pdf.setProperties({
      title: `تحليل موقع - ${websiteUrl}`,
      subject: 'تقرير تحليل الموقع',
      creator: 'محلل المواقع'
    });

    // Add header
    pdf.setFont('Tajawal-Bold');
    pdf.setFontSize(24);
    pdf.text('تقرير تحليل الموقع', pdf.internal.pageSize.width / 2, 20, { align: 'center' });
    
    // Add website URL
    pdf.setFontSize(14);
    pdf.text(websiteUrl, pdf.internal.pageSize.width / 2, 30, { align: 'center' });

    // Add the main content
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdfWidth = pdf.internal.pageSize.width;
    const pdfHeight = pdf.internal.pageSize.height;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate optimal scaling
    const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 40) / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    // Add content with pagination
    let heightLeft = imgHeight;
    let position = 0;
    let page = 1;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, 'JPEG', imgX, page === 1 ? 40 : 10, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= (pdfHeight - (page === 1 ? 50 : 20));
      
      if (heightLeft >= 0) {
        pdf.addPage();
        page++;
      }
    }

    // Add page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(
        `${i} / ${pageCount}`,
        pdf.internal.pageSize.width / 2,
        pdf.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const filename = `تحليل-موقع-${websiteUrl.replace(/https?:\/\//i, '').replace(/[^\w]/g, '-')}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    return false;
  }
};
