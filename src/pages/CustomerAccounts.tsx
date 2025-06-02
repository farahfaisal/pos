import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Search, 
  Plus, 
  FileText, 
  CreditCard,
  DollarSign,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
  Check,
  Download
} from 'lucide-react';
import { Customer } from '../types/Customer';
import { CustomerAccount, AccountTransaction, AccountStatement } from '../types/CustomerAccount';
import { formatCurrency, formatDate } from '../utils/formatters';
import NumericKeypad from '../components/pos/NumericKeypad';

// Mock customers data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'محمد أحمد',
    phone: '0501234567',
    email: 'mohammed@example.com',
    type: 'retail',
    totalPurchases: 1500,
    lastVisit: new Date('2024-02-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '2',
    name: 'شركة التقنية المتقدمة',
    phone: '0551234567',
    email: 'info@techcompany.com',
    type: 'wholesale',
    discount: {
      type: 'percentage',
      value: 10
    },
    totalPurchases: 15000,
    lastVisit: new Date('2024-02-20'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-02-20'),
  }
];

// Mock accounts data
const mockAccounts: CustomerAccount[] = [
  {
    id: '1',
    customerId: '1',
    balance: -1500,
    creditLimit: 5000,
    lastTransactionDate: new Date('2024-02-20'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: '2',
    customerId: '2',
    balance: 2000,
    creditLimit: 10000,
    lastTransactionDate: new Date('2024-02-21'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-02-21')
  }
];

const mockTransactions: AccountTransaction[] = [
  {
    id: '1',
    accountId: '1',
    amount: -1500,
    type: 'sale',
    reference: 'INV-001',
    description: 'شراء منتجات',
    createdAt: new Date('2024-02-20'),
    createdBy: 'cashier1'
  },
  {
    id: '2',
    accountId: '2',
    amount: 2000,
    type: 'payment',
    reference: 'PAY-001',
    description: 'دفعة نقدية',
    createdAt: new Date('2024-02-21'),
    createdBy: 'cashier1'
  }
];

const CustomerAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [statementDateRange, setStatementDateRange] = useState({
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date()
  });

  useEffect(() => {
    // In a real app, fetch from API
    setAccounts(mockAccounts);
    setTransactions(mockTransactions);
  }, []);

  const handlePayment = () => {
    if (!selectedAccount || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newTransaction: AccountTransaction = {
      id: Math.random().toString(),
      accountId: selectedAccount.id,
      amount: amount,
      type: 'payment',
      reference: `PAY-${Date.now()}`,
      description: 'دفعة نقدية',
      createdAt: new Date(),
      createdBy: 'current-user'
    };

    // Update account balance
    const updatedAccount = {
      ...selectedAccount,
      balance: selectedAccount.balance + amount,
      lastTransactionDate: new Date(),
      updatedAt: new Date()
    };

    setAccounts(prev => prev.map(acc => 
      acc.id === selectedAccount.id ? updatedAccount : acc
    ));
    setTransactions(prev => [...prev, newTransaction]);
    setShowPaymentModal(false);
    setPaymentAmount('');
  };

  const generateStatement = (): AccountStatement | null => {
    if (!selectedAccount) return null;

    const customer = mockCustomers.find(c => c.id === selectedAccount.customerId);
    if (!customer) return null;

    const accountTransactions = transactions
      .filter(t => t.accountId === selectedAccount.id)
      .filter(t => {
        const date = new Date(t.createdAt);
        return date >= statementDateRange.startDate && date <= statementDateRange.endDate;
      })
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Calculate opening balance
    const openingBalance = selectedAccount.balance - accountTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      account: selectedAccount,
      customer,
      transactions: accountTransactions,
      startDate: statementDateRange.startDate,
      endDate: statementDateRange.endDate,
      openingBalance,
      closingBalance: selectedAccount.balance
    };
  };

  const downloadStatement = () => {
    const statement = generateStatement();
    if (!statement) return;

    // Generate PDF or Excel file
    // For now, just log the statement
    console.log('Statement:', statement);
  };

  return (
    <Layout title="حسابات العملاء">
      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
            placeholder="بحث عن عميل..."
          />
        </div>
      </div>

      {/* Accounts table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرصيد
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  حد الائتمان
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر معاملة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => {
                const customer = mockCustomers.find(c => c.id === account.customerId);
                if (!customer) return null;

                return (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.balance >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(account.creditLimit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(account.lastTransactionDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowPaymentModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 ml-4"
                      >
                        <DollarSign size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowStatementModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">تسجيل دفعة</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">الرصيد الحالي:</div>
                <div className={`text-2xl font-bold ${
                  selectedAccount.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(selectedAccount.balance)}
                </div>
              </div>

              <NumericKeypad
                value={paymentAmount}
                onChange={setPaymentAmount}
                onClear={() => setPaymentAmount('')}
                onSubmit={handlePayment}
              />
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                إلغاء
              </button>

              <button
                onClick={handlePayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                className={`flex-1 py-2 px-4 rounded-md ${
                  !paymentAmount || parseFloat(paymentAmount) <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Check size={18} className="ml-2" />
                  تأكيد الدفع
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {showStatementModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">كشف حساب</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={downloadStatement}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setShowStatementModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Date range selection */}
              <div className="mb-6 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    من تاريخ
                  </label>
                  <input
                    type="date"
                    value={statementDateRange.startDate.toISOString().split('T')[0]}
                    onChange={(e) => setStatementDateRange(prev => ({
                      ...prev,
                      startDate: new Date(e.target.value)
                    }))}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    إلى تاريخ
                  </label>
                  <input
                    type="date"
                    value={statementDateRange.endDate.toISOString().split('T')[0]}
                    onChange={(e) => setStatementDateRange(prev => ({
                      ...prev,
                      endDate: new Date(e.target.value)
                    }))}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Statement content */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">الرصيد الافتتاحي:</div>
                      <div className="text-lg font-bold">
                        {formatCurrency(generateStatement()?.openingBalance || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">الرصيد الختامي:</div>
                      <div className="text-lg font-bold">
                        {formatCurrency(generateStatement()?.closingBalance || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التاريخ
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المرجع
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الوصف
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          مدين
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          دائن
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الرصيد
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {generateStatement()?.transactions.map((transaction, index) => {
                        const runningBalance = generateStatement()?.openingBalance + 
                          generateStatement()?.transactions
                            .slice(0, index + 1)
                            .reduce((sum, t) => sum + t.amount, 0) || 0;

                        return (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.reference}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {transaction.amount < 0 ? formatCurrency(Math.abs(transaction.amount)) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {transaction.amount > 0 ? formatCurrency(transaction.amount) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {formatCurrency(runningBalance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CustomerAccounts;