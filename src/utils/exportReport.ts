import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from './formatters';
import { Transaction } from '../types/Transaction';
import { Product } from '../types/Product';

export const exportReport = (
  type: 'sales' | 'products' | 'payment',
  data: {
    transactions?: Transaction[];
    products?: Product[];
    salesByMethod?: Record<string, number>;
    period: string;
    totalSales?: number;
  }
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add Arabic font support
  doc.addFont('assets/fonts/NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
  doc.setFont('NotoNaskhArabic');
  doc.setR2L(true);

  // Header
  doc.setFontSize(24);
  doc.text('تقرير ' + getReportTitle(type), 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`الفترة: ${period}`, 105, 30, { align: 'center' });
  doc.text(`تاريخ التصدير: ${formatDate(new Date())}`, 105, 40, { align: 'center' });

  let yPos = 60;

  switch (type) {
    case 'sales':
      if (data.transactions) {
        // Summary
        doc.setFontSize(16);
        doc.text('ملخص المبيعات', 190, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.text(`إجمالي المبيعات: ${formatCurrency(data.totalSales || 0)}`, 190, yPos);
        yPos += 8;
        doc.text(`عدد المعاملات: ${data.transactions.length}`, 190, yPos);
        yPos += 8;
        doc.text(`متوسط قيمة المعاملة: ${formatCurrency((data.totalSales || 0) / (data.transactions.length || 1))}`, 190, yPos);
        yPos += 20;

        // Transactions table
        doc.setFontSize(16);
        doc.text('تفاصيل المعاملات', 190, yPos);
        yPos += 10;

        // Table headers
        doc.setFontSize(12);
        doc.text('رقم الفاتورة', 180, yPos);
        doc.text('التاريخ', 140, yPos);
        doc.text('العميل', 100, yPos);
        doc.text('المبلغ', 60, yPos);
        doc.text('طريقة الدفع', 20, yPos);
        yPos += 8;

        // Table content
        data.transactions.forEach(transaction => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.text(transaction.receiptNumber, 180, yPos);
          doc.text(formatDate(transaction.createdAt), 140, yPos);
          doc.text(transaction.customerName || 'عميل عام', 100, yPos);
          doc.text(formatCurrency(transaction.total), 60, yPos);
          doc.text(
            transaction.paymentMethod === 'cash' ? 'نقدي' :
            transaction.paymentMethod === 'card' ? 'بطاقة' : 'محفظة',
            20, yPos
          );
          yPos += 8;
        });
      }
      break;

    case 'products':
      if (data.products) {
        // Low stock products
        const lowStockProducts = data.products.filter(p => p.stockQuantity < 10);
        
        doc.setFontSize(16);
        doc.text('المنتجات منخفضة المخزون', 190, yPos);
        yPos += 10;

        // Table headers
        doc.setFontSize(12);
        doc.text('المنتج', 180, yPos);
        doc.text('الكمية', 140, yPos);
        doc.text('السعر', 100, yPos);
        yPos += 8;

        // Table content
        lowStockProducts.forEach(product => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.text(product.name, 180, yPos);
          doc.text(product.stockQuantity.toString(), 140, yPos);
          doc.text(formatCurrency(product.price), 100, yPos);
          yPos += 8;
        });
      }
      break;

    case 'payment':
      if (data.salesByMethod) {
        doc.setFontSize(16);
        doc.text('المبيعات حسب طريقة الدفع', 190, yPos);
        yPos += 10;

        doc.setFontSize(12);
        Object.entries(data.salesByMethod).forEach(([method, amount]) => {
          doc.text(
            `${method === 'cash' ? 'نقدي' : method === 'card' ? 'بطاقة' : 'محفظة'}: ${formatCurrency(amount)}`,
            190, yPos
          );
          yPos += 8;
        });

        // Add pie chart
        const total = Object.values(data.salesByMethod).reduce((a, b) => a + b, 0);
        let startAngle = 0;
        const centerX = 105;
        const centerY = yPos + 40;
        const radius = 30;

        Object.entries(data.salesByMethod).forEach(([method, amount]) => {
          const portion = amount / total;
          const endAngle = startAngle + (portion * 2 * Math.PI);
          
          doc.setFillColor(
            method === 'cash' ? '#22c55e' :
            method === 'card' ? '#3b82f6' : '#a855f7'
          );
          
          doc.circle(centerX, centerY, radius, 'F');
          startAngle = endAngle;
        });
      }
      break;
  }

  // Save the PDF
  doc.save(`تقرير_${getReportTitle(type)}_${formatDate(new Date())}.pdf`);
};

const getReportTitle = (type: 'sales' | 'products' | 'payment'): string => {
  switch (type) {
    case 'sales':
      return 'المبيعات';
    case 'products':
      return 'المنتجات';
    case 'payment':
      return 'طرق الدفع';
  }
};