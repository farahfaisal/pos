import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Customer } from '../../types/Customer';
import { CartItem } from '../../types/Product';
import { PaymentMethod } from '../../types/Transaction';
import { Printer, Eye, X, Settings } from 'lucide-react';
import NumericKeypad from './NumericKeypad';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

interface PaymentFormProps {
  total: number;
  items: CartItem[];
  customer?: Customer | null;
  onPaymentComplete: (payments: { method: PaymentMethod; amount: number }[]) => void;
  onCancel: () => void;
}

interface PaymentPart {
  method: PaymentMethod;
  amount: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  total, 
  items,
  customer,
  onPaymentComplete, 
  onCancel 
}) => {
  const { canManageCashDrawer } = useAuth();
  const { settings } = useSettings();
  const [payment, setPayment] = useState<PaymentPart>({
    method: PaymentMethod.CASH,
    amount: ''
  });
  const [payments, setPayments] = useState<PaymentPart[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [printReceipt, setPrintReceipt] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([]);

  useEffect(() => {
    if (customer?.discount) {
      setDiscountType(customer.discount.type);
      setDiscountValue(customer.discount.value.toString());
    }
  }, [customer]);

  useEffect(() => {
    if ('printer' in window && 'getPrinters' in (window as any).printer) {
      (window as any).printer.getPrinters().then((printers: string[]) => {
        setAvailablePrinters(printers);
        if (printers.length > 0) {
          setSelectedPrinter(printers[0]);
        }
      });
    }
  }, []);

  const calculateDiscount = () => {
    if (!discountValue) return 0;
    const value = parseFloat(discountValue);
    if (isNaN(value)) return 0;
    
    return discountType === 'percentage' 
      ? (total * value) / 100 
      : value;
  };

  const finalAmount = total - calculateDiscount();

  const totalPaid = payments.reduce((sum, p) => {
    const amount = parseFloat(p.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = finalAmount - totalPaid;

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPayment({ ...payment, method });
  };

  const handleAmountChange = (amount: string) => {
    setPayment({ ...payment, amount });
  };

  const handleAddPayment = () => {
    // Allow empty or zero amount
    if (!payment.amount) {
      setPayment({ ...payment, amount: '0' });
    }
    
    setPayments([...payments, payment]);
    setPayment({ method: PaymentMethod.CASH, amount: '' });
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const getReceiptContent = () => {
    const receiptNumber = new Date().getTime().toString();
    const discount = calculateDiscount();
    const paid = totalPaid;
    const change = Math.max(paid - finalAmount, 0);

    return `
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة</title>
          <style>
            @page {
              margin: 0;
              padding: 0;
              width: 80mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
              width: 80mm;
              font-size: 12px;
            }
            .logo {
              text-align: center;
              margin-bottom: 10px;
            }
            .logo img {
              max-width: 100px;
              max-height: 100px;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .store-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .receipt-info {
              font-size: 12px;
              margin-bottom: 5px;
            }
            .items {
              width: 100%;
              margin-bottom: 10px;
              border-collapse: collapse;
            }
            .items th {
              border-bottom: 1px solid #000;
              padding: 5px 0;
              text-align: right;
              font-size: 10px;
            }
            .items td {
              padding: 5px 0;
              text-align: right;
              font-size: 12px;
            }
            .summary {
              margin-top: 10px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .total {
              font-weight: bold;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 1px dashed #000;
              padding-top: 10px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          ${settings?.store?.logo ? `
            <div class="logo">
              <img src="${settings.store.logo}" alt="${settings?.store?.name || ''}" />
            </div>
          ` : ''}

          <div class="header">
            <div class="store-name">${settings?.store?.name || 'نظام نقطة البيع'}</div>
            ${settings?.store?.address ? `<div class="receipt-info">${settings.store.address}</div>` : ''}
            ${settings?.store?.phone ? `<div class="receipt-info">هاتف: ${settings.store.phone}</div>` : ''}
            ${settings?.store?.vat ? `<div class="receipt-info">الرقم الضريبي: ${settings.store.vat}</div>` : ''}
            <div class="receipt-info">رقم الفاتورة: ${receiptNumber}</div>
            <div class="receipt-info">التاريخ: ${new Date().toLocaleDateString('ar')}</div>
            <div class="receipt-info">الوقت: ${new Date().toLocaleTimeString('ar')}</div>
            ${customer ? `<div class="receipt-info">العميل: ${customer.name}</div>` : ''}
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>الصنف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>المجموع:</span>
              <span>${formatCurrency(total)}</span>
            </div>
            ${discount > 0 ? `
              <div class="summary-row">
                <span>الخصم:</span>
                <span>${formatCurrency(discount)}</span>
              </div>
            ` : ''}
            <div class="summary-row total">
              <span>الإجمالي النهائي:</span>
              <span>${formatCurrency(finalAmount)}</span>
            </div>
            ${payments.map(p => `
              <div class="summary-row">
                <span>${p.method === PaymentMethod.CASH ? 'نقدي' : 
                       p.method === PaymentMethod.CARD ? 'بطاقة' : 'محفظة'}:</span>
                <span>${formatCurrency(parseFloat(p.amount) || 0)}</span>
              </div>
            `).join('')}
            <div class="summary-row">
              <span>الباقي:</span>
              <span>${formatCurrency(change)}</span>
            </div>
          </div>

          <div class="footer">
            <p>${settings?.receipt?.footerText || 'شكراً لتسوقكم معنا'}</p>
            <p>نتمنى لكم يوماً سعيداً</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintReceipt = () => {
    if ('printer' in window && 'print' in (window as any).printer) {
      (window as any).printer.print(selectedPrinter, getReceiptContent());
    } else {
      const receiptWindow = window.open('', '_blank');
      if (!receiptWindow) return;

      receiptWindow.document.write(getReceiptContent());
      receiptWindow.document.close();
      receiptWindow.print();
      receiptWindow.close();
    }
  };

  const handlePaymentComplete = () => {
    if (!canManageCashDrawer) return;
    
    // Allow completion even if remaining amount is not zero
    if (printReceipt) {
      handlePrintReceipt();
    }
    
    onPaymentComplete(payments.map(p => ({
      method: p.method,
      amount: parseFloat(p.amount) || 0
    })));
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg">
      <div className="flex">
        {/* Left side - Payment methods */}
        <div className="w-1/2 p-6">
          <h2 className="text-lg font-bold mb-4">طرق الدفع</h2>

          <div className="space-y-4">
            {/* Payment method selection */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handlePaymentMethodChange(PaymentMethod.CASH)}
                className={`p-4 border rounded-lg flex flex-col items-center ${
                  payment.method === PaymentMethod.CASH
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-lg">💵</span>
                <span className="mt-1 text-sm">نقدي</span>
              </button>

              <button
                onClick={() => handlePaymentMethodChange(PaymentMethod.CARD)}
                className={`p-4 border rounded-lg flex flex-col items-center ${
                  payment.method === PaymentMethod.CARD
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-lg">💳</span>
                <span className="mt-1 text-sm">بطاقة</span>
              </button>

              <button
                onClick={() => handlePaymentMethodChange(PaymentMethod.MOBILE)}
                className={`p-4 border rounded-lg flex flex-col items-center ${
                  payment.method === PaymentMethod.MOBILE
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-lg">📱</span>
                <span className="mt-1 text-sm">محفظة</span>
              </button>
            </div>

            {/* Amount input */}
            <div className="mt-4">
              <NumericKeypad
                value={payment.amount}
                onChange={handleAmountChange}
                onClear={() => handleAmountChange('')}
                onSubmit={handleAddPayment}
              />
            </div>
          </div>
        </div>

        {/* Right side - Payment summary */}
        <div className="w-1/2 p-6 border-r">
          <h2 className="text-lg font-bold mb-4">ملخص الدفع</h2>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2">المبلغ الأصلي: <span className="font-bold">{formatCurrency(total)}</span></div>

              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="font-bold mb-2">خصم:</div>
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discount"
                      checked={discountType === 'percentage'}
                      onChange={() => setDiscountType('percentage')}
                      className="ml-1"
                    />
                    نسبة مئوية
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discount"
                      checked={discountType === 'fixed'}
                      onChange={() => setDiscountType('fixed')}
                      className="ml-1"
                    />
                    مبلغ ثابت
                  </label>
                </div>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full border rounded p-2 text-center"
                  placeholder={discountType === 'percentage' ? '%' : '0.00'}
                />
              </div>

              <div className="border-t border-gray-200 mt-2 pt-2">
                <div>المبلغ المطلوب: <span className="font-bold">{formatCurrency(finalAmount)}</span></div>
                <div>المدفوع: <span className="font-bold">{formatCurrency(totalPaid)}</span></div>
                <div>المتبقي: <span className={`font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(remainingAmount)}
                </span></div>
              </div>
            </div>

            {/* Added payments */}
            {payments.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">المدفوعات:</h3>
                {payments.map((p, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">
                        {p.method === PaymentMethod.CASH ? 'نقدي' :
                         p.method === PaymentMethod.CARD ? 'بطاقة' : 'محفظة'}
                      </span>
                      <span className="mr-2">{formatCurrency(parseFloat(p.amount) || 0)}</span>
                    </div>
                    <button
                      onClick={() => handleRemovePayment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  className="ml-2"
                />
                <Printer size={16} className="ml-1" />
                طباعة الفاتورة
              </label>

              <div className="flex gap-2">
                {printReceipt && (
                  <button
                    onClick={() => setShowPrinterModal(true)}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <Settings size={16} className="ml-1" />
                    الطابعة
                  </button>
                )}

                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <Eye size={16} className="ml-1" />
                  معاينة
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onCancel}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                إلغاء
              </button>

              <button
                onClick={handlePaymentComplete}
                className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                تأكيد الدفع
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[80mm] max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">معاينة الفاتورة</h3>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              srcDoc={getReceiptContent()}
              className="w-full h-[70vh]"
              style={{ border: 'none' }}
            />
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printer Settings Modal */}
      {showPrinterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">إعدادات الطباعة</h3>
              <button 
                onClick={() => setShowPrinterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اختر الطابعة
                  </label>
                  <select
                    value={selectedPrinter}
                    onChange={(e) => setSelectedPrinter(e.target.value)}
                    className="w-full border rounded p-2"
                  >
                    {availablePrinters.map((printer) => (
                      <option key={printer} value={printer}>
                        {printer}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setShowPrinterModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;