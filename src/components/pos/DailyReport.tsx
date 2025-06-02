import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { 
  DollarSign,
  CreditCard,
  Smartphone,
  ArrowUpCircle,
  ArrowDownCircle,
  FileText,
  Download
} from 'lucide-react';

interface DailyReportProps {
  date?: Date;
  openingBalance: number;
  closingBalance: number;
  sales: {
    cash: number;
    card: number;
    mobile: number;
  };
}

const DailyReport: React.FC<DailyReportProps> = ({ 
  date = new Date(),
  openingBalance,
  closingBalance,
  sales
}) => {
  const totalSales = sales.cash + sales.card + sales.mobile;
  const expectedBalance = openingBalance + sales.cash;
  const difference = closingBalance - expectedBalance;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">تقرير المبيعات اليومي</h2>
        <button className="flex items-center text-blue-600 hover:text-blue-800">
          <Download size={18} className="ml-1" />
          تصدير
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Cash sales */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">مبيعات نقدية</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(sales.cash)}</h3>
          </div>

          {/* Card sales */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard size={20} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">مبيعات بطاقات</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(sales.card)}</h3>
          </div>

          {/* Mobile payment sales */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Smartphone size={20} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600">محفظة إلكترونية</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(sales.mobile)}</h3>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">ملخص الصندوق</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ArrowUpCircle size={20} className="text-gray-400 ml-2" />
                  <span>الرصيد الافتتاحي</span>
                </div>
                <span className="font-medium">{formatCurrency(openingBalance)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign size={20} className="text-gray-400 ml-2" />
                  <span>إجمالي المبيعات النقدية</span>
                </div>
                <span className="font-medium">{formatCurrency(sales.cash)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ArrowDownCircle size={20} className="text-gray-400 ml-2" />
                  <span>الرصيد الختامي</span>
                </div>
                <span className="font-medium">{formatCurrency(closingBalance)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-dashed">
                <div className="flex items-center">
                  <FileText size={20} className="text-gray-400 ml-2" />
                  <span>الفرق</span>
                </div>
                <span className={`font-medium ${
                  difference === 0 
                    ? 'text-green-600' 
                    : difference > 0
                      ? 'text-blue-600'
                      : 'text-red-600'
                }`}>
                  {formatCurrency(difference)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">إحصائيات المبيعات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>إجمالي المبيعات</span>
                <span className="font-medium">{formatCurrency(totalSales)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>عدد المعاملات</span>
                <span className="font-medium">15</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>متوسط قيمة المعاملة</span>
                <span className="font-medium">{formatCurrency(totalSales / 15)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">توزيع طرق الدفع</h3>
            <div className="space-y-4">
              {/* Cash payments */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>نقدي</span>
                  <span>{Math.round((sales.cash / totalSales) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(sales.cash / totalSales) * 100}%` }}
                  />
                </div>
              </div>

              {/* Card payments */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>بطاقات</span>
                  <span>{Math.round((sales.card / totalSales) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(sales.card / totalSales) * 100}%` }}
                  />
                </div>
              </div>

              {/* Mobile payments */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>محفظة إلكترونية</span>
                  <span>{Math.round((sales.mobile / totalSales) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(sales.mobile / totalSales) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;