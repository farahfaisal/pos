import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Calendar, 
  Download, 
  ChevronLeft,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  DollarSign,
  BarChart3,
  Package,
  Filter
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Transaction, PaymentMethod } from '../types/Transaction';
import { Report } from '../types/Report';
import { exportReport } from '../utils/exportReport';
import { supabase } from '../lib/supabase';

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [reportType, setReportType] = useState<'sales' | 'products' | 'payment'>('sales');
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });

  useEffect(() => {
    loadReports();
  }, [dateRange, reportType]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const startDate = getStartDate();
      const endDate = getEndDate();

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('type', reportType)
        .gte('start_date', startDate.toISOString())
        .lte('end_date', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(data.map(report => ({
        ...report,
        startDate: new Date(report.start_date),
        endDate: new Date(report.end_date),
        createdAt: new Date(report.created_at),
        updatedAt: new Date(report.updated_at)
      })));
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('حدث خطأ أثناء تحميل التقارير');
    } finally {
      setIsLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'custom':
        return customDateRange.startDate;
      default:
        return new Date(now.setHours(0, 0, 0, 0));
    }
  };

  const getEndDate = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return new Date(now.setHours(23, 59, 59, 999));
      case 'week':
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - now.getDay() + 6);
        return weekEnd;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
      case 'custom':
        return customDateRange.endDate;
      default:
        return new Date(now.setHours(23, 59, 59, 999));
    }
  };

  const handleExport = (report: Report) => {
    exportReport(report.type, {
      transactions: report.data.transactions,
      products: report.data.products,
      salesByMethod: report.data.salesByMethod,
      period: report.period,
      totalSales: report.data.totalSales
    });
  };

  const renderReportContent = (report: Report) => {
    switch (report.type) {
      case 'sales':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">ملخص المبيعات</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <DollarSign size={20} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-blue-600">إجمالي المبيعات</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {formatCurrency(report.data.totalSales || 0)}
                  </h3>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ShoppingCart size={20} className="text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-green-600">عدد المعاملات</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {report.data.transactions?.length || 0}
                  </h3>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <TrendingUp size={20} className="text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-600">متوسط قيمة الطلب</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {formatCurrency(
                      (report.data.totalSales || 0) / 
                      (report.data.transactions?.length || 1)
                    )}
                  </h3>
                </div>
              </div>
            </div>

            {report.data.transactions && report.data.transactions.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">تفاصيل المبيعات</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          رقم الفاتورة
                        </th>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التاريخ
                        </th>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العميل
                        </th>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          طريقة الدفع
                        </th>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.data.transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6 text-sm font-medium text-gray-900">
                            {transaction.receiptNumber}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar size={16} className="text-gray-400 ml-2" />
                              {formatDate(new Date(transaction.createdAt))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {transaction.customerName || 'عميل عام'}
                          </td>
                          <td className="py-4 px-6 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.paymentMethod === 'cash'
                                ? 'bg-green-100 text-green-800'
                                : transaction.paymentMethod === 'card'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                            }`}>
                              {transaction.paymentMethod === 'cash' ? 'نقدي' :
                               transaction.paymentMethod === 'card' ? 'بطاقة' : 'محفظة إلكترونية'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-gray-900">
                            {formatCurrency(transaction.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            {report.data.products && report.data.products.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">المنتجات الأكثر مبيعاً</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المنتج
                        </th>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الكمية المباعة
                        </th>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          إجمالي المبيعات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.data.products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6 text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {product.quantity} وحدة
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-gray-900">
                            {formatCurrency(product.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'payment':
        if (!report.data.salesByMethod) return null;
        
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">المبيعات حسب طريقة الدفع</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign size={20} className="text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-green-600">نقدي</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {formatCurrency(report.data.salesByMethod.cash || 0)}
                    </h3>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <CreditCard size={20} className="text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-blue-600">بطاقة</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {formatCurrency(report.data.salesByMethod.card || 0)}
                    </h3>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <BarChart3 size={20} className="text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-purple-600">محفظة إلكترونية</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {formatCurrency(report.data.salesByMethod.mobile || 0)}
                    </h3>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">توزيع طرق الدفع</h4>
                    <div className="space-y-4">
                      {Object.entries(report.data.salesByMethod).map(([method, amount]) => {
                        const total = Object.values(report.data.salesByMethod || {})
                          .reduce((sum, val) => sum + (val || 0), 0);
                        const percentage = total > 0 ? (amount / total) * 100 : 0;

                        return (
                          <div key={method} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {method === 'cash' ? 'نقدي' :
                                 method === 'card' ? 'بطاقة' : 'محفظة إلكترونية'}
                              </span>
                              <span className="font-medium">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  method === 'cash' ? 'bg-green-500' :
                                  method === 'card' ? 'bg-blue-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Layout title="التقارير">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="التقارير">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-800 mb-4">أنواع التقارير</h2>
            
            <div className="space-y-2">
              <button
                onClick={() => setReportType('sales')}
                className={`w-full flex items-center rounded-md p-3 ${
                  reportType === 'sales' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <TrendingUp size={18} className="ml-3" />
                <span>تقرير المبيعات</span>
                {reportType === 'sales' && <ChevronLeft size={18} className="mr-auto" />}
              </button>
              
              <button
                onClick={() => setReportType('products')}
                className={`w-full flex items-center rounded-md p-3 ${
                  reportType === 'products' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Package size={18} className="ml-3" />
                <span>تقرير المنتجات</span>
                {reportType === 'products' && <ChevronLeft size={18} className="mr-auto" />}
              </button>
              
              <button
                onClick={() => setReportType('payment')}
                className={`w-full flex items-center rounded-md p-3 ${
                  reportType === 'payment' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <CreditCard size={18} className="ml-3" />
                <span>تقرير وسائل الدفع</span>
                {reportType === 'payment' && <ChevronLeft size={18} className="mr-auto" />}
              </button>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">الفترة الزمنية</h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => setDateRange('today')}
                  className={`w-full flex items-center rounded-md p-3 ${
                    dateRange === 'today' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>اليوم</span>
                  {dateRange === 'today' && <ChevronLeft size={18} className="mr-auto" />}
                </button>
                
                <button
                  onClick={() => setDateRange('week')}
                  className={`w-full flex items-center rounded-md p-3 ${
                    dateRange === 'week' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>هذا الأسبوع</span>
                  {dateRange === 'week' && <ChevronLeft size={18} className="mr-auto" />}
                </button>
                
                <button
                  onClick={() => setDateRange('month')}
                  className={`w-full flex items-center rounded-md p-3 ${
                    dateRange === 'month' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>هذا الشهر</span>
                  {dateRange === 'month' && <ChevronLeft size={18} className="mr-auto" />}
                </button>
                
                <button
                  onClick={() => setDateRange('custom')}
                  className={`w-full flex items-center rounded-md p-3 ${
                    dateRange === 'custom' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Calendar size={18} className="ml-3" />
                  <span>تخصيص</span>
                  {dateRange === 'custom' && <ChevronLeft size={18} className="mr-auto" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Report content */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {reportType === 'sales' 
                ? 'تقرير المبيعات' 
                : reportType === 'products'
                  ? 'تقرير المنتجات'
                  : 'تقرير وسائل الدفع'
              }
            </h2>
            
            <div className="text-sm text-gray-500 flex items-center">
              <Calendar size={16} className="ml-2" />
              <span>
                {dateRange === 'today' && 'اليوم'}
                {dateRange === 'week' && 'هذا الأسبوع'}
                {dateRange === 'month' && 'هذا الشهر'}
                {dateRange === 'custom' && 'فترة مخصصة'}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          {reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              لا توجد تقارير متاحة للفترة المحددة
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    {report.title}
                  </h3>
                  <button
                    onClick={() => handleExport(report)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Download size={18} className="ml-1" />
                    تصدير
                  </button>
                </div>
                {renderReportContent(report)}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;