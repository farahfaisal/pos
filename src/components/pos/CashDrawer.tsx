import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CashDrawerSession } from '../../types/CashDrawer';
import { 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle,
  FileText,
  Check,
  X,
  Calculator
} from 'lucide-react';
import NumericKeypad from './NumericKeypad';
import { useAuth } from '../../contexts/AuthContext';

interface CashDrawerProps {
  session: CashDrawerSession | null;
  onOpen: (amount: number) => void;
  onClose: (amount: number, notes?: string) => void;
  cashTransactions: number;
}

const CashDrawer: React.FC<CashDrawerProps> = ({ 
  session,
  onOpen,
  onClose,
  cashTransactions = 0
}) => {
  const { canManageCashDrawer } = useAuth();
  const [showOpenDrawer, setShowOpenDrawer] = useState(false);
  const [showCloseDrawer, setShowCloseDrawer] = useState(false);
  const [initialAmount, setInitialAmount] = useState('0');
  const [finalAmount, setFinalAmount] = useState('0');
  const [notes, setNotes] = useState('');

  // Calculate expected closing balance
  const expectedClosingBalance = session ? session.openingBalance + cashTransactions : 0;

  // Auto-set the final amount when opening the close drawer modal
  useEffect(() => {
    if (showCloseDrawer) {
      setFinalAmount(expectedClosingBalance.toString());
    }
  }, [showCloseDrawer, expectedClosingBalance]);

  const handleOpenDrawer = () => {
    if (!canManageCashDrawer) return;
    const amount = parseFloat(initialAmount);
    if (!isNaN(amount)) {
      onOpen(amount);
      setInitialAmount('0');
      setNotes('');
      setShowOpenDrawer(false);
    }
  };

  const handleCloseDrawer = () => {
    if (!canManageCashDrawer) return;
    const amount = parseFloat(finalAmount);
    if (!isNaN(amount)) {
      onClose(amount, notes);
      setFinalAmount('0');
      setNotes('');
      setShowCloseDrawer(false);
    }
  };

  // Calculate difference between expected and actual closing balance
  const calculateDifference = () => {
    const actual = parseFloat(finalAmount);
    if (isNaN(actual)) return 0;
    return actual - expectedClosingBalance;
  };

  const difference = calculateDifference();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">حالة الصندوق</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          session?.status === 'open' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {session?.status === 'open' ? 'مفتوح' : 'مغلق'}
        </div>
      </div>

      {session?.status === 'open' && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">الرصيد الافتتاحي:</span>
            <span className="font-medium">{formatCurrency(session.openingBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">المبيعات النقدية:</span>
            <span className="font-medium text-green-600">+ {formatCurrency(cashTransactions)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">الرصيد المتوقع:</span>
            <span className="font-medium">{formatCurrency(expectedClosingBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">وقت الفتح:</span>
            <span className="font-medium">
              {new Intl.DateTimeFormat('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }).format(session.openedAt)}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowOpenDrawer(true)}
          disabled={session?.status === 'open'}
          className={`flex items-center justify-center p-4 rounded-lg border ${
            session?.status === 'open'
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-red-50 text-red-800 hover:bg-red-100 border-red-200'
          }`}
        >
          <ArrowUpCircle className="ml-2" />
          فتح الصندوق
        </button>

        <button
          onClick={() => setShowCloseDrawer(true)}
          disabled={session?.status !== 'open'}
          className={`flex items-center justify-center p-4 rounded-lg border ${
            session?.status !== 'open'
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-red-50 text-red-800 hover:bg-red-100 border-red-200'
          }`}
        >
          <ArrowDownCircle className="ml-2" />
          إغلاق الصندوق
        </button>
      </div>

      {/* Open Drawer Modal */}
      {showOpenDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">فتح الصندوق</h2>
              <button onClick={() => setShowOpenDrawer(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الرصيد الافتتاحي <span className="text-red-500">*</span>
                  </label>
                  <NumericKeypad
                    value={initialAmount}
                    onChange={setInitialAmount}
                    onClear={() => setInitialAmount('0')}
                    onSubmit={handleOpenDrawer}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <div className="relative">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-right"
                      placeholder="أدخل أي ملاحظات إضافية"
                      rows={3}
                    />
                    <FileText size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button
                onClick={() => setShowOpenDrawer(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                إلغاء
              </button>

              <button
                onClick={handleOpenDrawer}
                disabled={!initialAmount || initialAmount === '0'}
                className={`flex-1 py-2 px-4 rounded-md ${
                  !initialAmount || initialAmount === '0'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-800 text-white hover:bg-red-900'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Check size={18} className="ml-2" />
                  فتح الصندوق
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Drawer Modal */}
      {showCloseDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">إغلاق الصندوق</h2>
              <button onClick={() => setShowCloseDrawer(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">الرصيد الافتتاحي:</span>
                    <span className="font-medium">{formatCurrency(session?.openingBalance || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">المبيعات النقدية:</span>
                    <span className="font-medium text-green-600">+ {formatCurrency(cashTransactions)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>الرصيد المتوقع:</span>
                    <span>{formatCurrency(expectedClosingBalance)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الرصيد الختامي <span className="text-red-500">*</span>
                  </label>
                  <NumericKeypad
                    value={finalAmount}
                    onChange={setFinalAmount}
                    onClear={() => setFinalAmount('0')}
                    onSubmit={handleCloseDrawer}
                  />
                </div>

                {finalAmount && finalAmount !== '0' && (
                  <div className={`p-3 rounded-lg ${
                    difference === 0 
                      ? 'bg-green-50 text-green-800' 
                      : difference > 0
                        ? 'bg-blue-50 text-blue-800'
                        : 'bg-red-50 text-red-800'
                  }`}>
                    <div className="flex items-center">
                      <Calculator size={18} className="ml-2" />
                      <span>
                        {difference === 0 
                          ? 'الرصيد مطابق' 
                          : difference > 0
                            ? `زيادة في الصندوق: ${formatCurrency(difference)}`
                            : `نقص في الصندوق: ${formatCurrency(Math.abs(difference))}`
                        }
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <div className="relative">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-right"
                      placeholder="أدخل أي ملاحظات إضافية"
                      rows={3}
                    />
                    <FileText size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button
                onClick={() => setShowCloseDrawer(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                إلغاء
              </button>

              <button
                onClick={handleCloseDrawer}
                disabled={!finalAmount || finalAmount === '0'}
                className={`flex-1 py-2 px-4 rounded-md ${
                  !finalAmount || finalAmount === '0'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-800 text-white hover:bg-red-900'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Check size={18} className="ml-2" />
                  إغلاق الصندوق
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashDrawer;