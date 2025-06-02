import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  Percent,
  ShoppingCart,
  Package,
  TrendingUp,
  ChevronLeft,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Transaction } from '../types/Transaction';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get date range based on selected period
      const { startDate, endDate } = getDateRange(period);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          customers (
            name
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Fetch products stats
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, stock_quantity');

      if (productsError) throw productsError;

      // Set transactions
      setTransactions(transactionsData.map(t => ({
        ...t,
        customerName: t.customers?.name,
        createdAt: new Date(t.created_at)
      })));

      // Set products stats
      setTotalProducts(productsData.length);
      setLowStockProducts(productsData.filter(p => p.stock_quantity < 10).length);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = (selectedPeriod: 'today' | 'week' | 'month') => {
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);

    switch (selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  };

  // Calculate dashboard statistics
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = transactions.length;
  const averageTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Calculate sales by payment method
  const salesByMethod = transactions.reduce((acc, t) => {
    acc[t.payment_method] = (acc[t.payment_method] || 0) + t.total;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      calendar: 'gregory'
    }).format(date);
  };

  if (isLoading) {
    return (
      <Layout title="لوحة التحكم">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="لوحة التحكم">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          مرحباً، {user?.name}
        </h2>
        <p className="text-gray-600">
          هذه نظرة عامة على نشاط متجرك
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {/* Period selection */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              period === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            اليوم
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 text-sm font-medium ${
              period === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            آخر 7 أيام
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              period === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            آخر 30 يوم
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">المبيعات</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totalSales)}</h3>
            <p className="text-gray-500 text-sm mt-1">إجمالي المبيعات</p>
          </div>
          <div className="bg-blue-50 px-5 py-2 border-t border-blue-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600 font-medium">عرض التفاصيل</span>
              <ChevronLeft size={16} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingCart size={24} className="text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">الطلبات</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{totalTransactions}</h3>
            <p className="text-gray-500 text-sm mt-1">عدد الطلبات</p>
          </div>
          <div className="bg-green-50 px-5 py-2 border-t border-green-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 font-medium">عرض التفاصيل</span>
              <ChevronLeft size={16} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Package size={24} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600">المنتجات</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{totalProducts}</h3>
            <p className="text-gray-500 text-sm mt-1">إجمالي المنتجات</p>
          </div>
          <div className="bg-purple-50 px-5 py-2 border-t border-purple-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-600 font-medium">عرض التفاصيل</span>
              <ChevronLeft size={16} className="text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Percent size={24} className="text-amber-600" />
              </div>
              <span className="text-sm font-medium text-amber-600">المخزون المنخفض</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{lowStockProducts}</h3>
            <p className="text-gray-500 text-sm mt-1">منتجات تحتاج تجديد</p>
          </div>
          <div className="bg-amber-50 px-5 py-2 border-t border-amber-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-600 font-medium">عرض التفاصيل</span>
              <ChevronLeft size={16} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent transactions */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">آخر المبيعات</h3>
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
                  المبلغ
                </th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  طريقة الدفع
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    {transaction.receipt_number}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 ml-2" />
                      {formatDate(transaction.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.total)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {transaction.payment_method === 'cash' ? 'نقدي' : 
                     transaction.payment_method === 'card' ? 'بطاقة' : 'محفظة إلكترونية'}
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    لا توجد مبيعات في هذه الفترة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t">
          <button className="text-blue-600 font-medium text-sm hover:underline flex items-center justify-center w-full">
            عرض جميع المبيعات
            <ChevronLeft size={16} className="mr-1" />
          </button>
        </div>
      </div>

      {/* Sales by payment method */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">المبيعات حسب طريقة الدفع</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600">نقدي</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {formatCurrency(salesByMethod['cash'] || 0)}
              </h3>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 size={20} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600">بطاقة</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {formatCurrency(salesByMethod['card'] || 0)}
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
                {formatCurrency(salesByMethod['mobile'] || 0)}
              </h3>
            </div>
          </div>

          {/* Payment methods chart */}
          <div className="mt-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">توزيع طرق الدفع</h4>
              <div className="space-y-4">
                {Object.entries(salesByMethod).map(([method, amount]) => {
                  const percentage = (amount / totalSales) * 100;
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
    </Layout>
  );
};

export default Dashboard;