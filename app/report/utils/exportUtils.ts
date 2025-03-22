import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async () => {
  try {
    // إعداد ملف PDF بحجم A4 ودعم اللغة العربية
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // تحديد عنصر التقرير الذي سيتم تصويره
    const reportElement = document.querySelector('#report-container') as HTMLElement;
    if (!reportElement) {
      throw new Error('عنصر التقرير غير موجود');
    }

    // تحويل العنصر إلى صورة
    const canvas = await html2canvas(reportElement, {
      scale: 2, // زيادة الجودة
      useCORS: true, // للسماح بتضمين الصور من مصادر خارجية
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    // الحصول على البيانات من الصورة
    const imgData = canvas.toDataURL('image/png');

    // حساب نسبة العرض للتأكد من تناسبها مع صفحة PDF
    const imgWidth = 210; // عرض A4 بالمليمتر
    const pageHeight = 295; // ارتفاع A4 بالمليمتر
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // معالجة الصفحات المتعددة إذا كان التقرير طويلاً
    let heightLeft = imgHeight;
    let position = 0;
    
    // إضافة الصفحة الأولى
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // إضافة صفحات إضافية إذا لزم الأمر
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // تحميل ملف PDF
    pdf.save(`تقرير_تحليل_الموقع_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return true;
  } catch (error) {
    console.error('خطأ في إنشاء ملف PDF:', error);
    return false;
  }
};
