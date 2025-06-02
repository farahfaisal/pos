import React, { useState } from 'react';
import { X, Search, Calendar, Check } from 'lucide-react';
import { Transaction } from '../../types/Transaction';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface OrdersModalProps {
  transactions: Transaction[];
  onClose: () => void;
  onRetrieveOrder: (transaction: Transaction) => void;
}

const OrdersModal: React.FC<OrdersModalProps> = ({
  transactions,
  onClose,
  onRetrieveOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return transaction.receiptNumber.toLowerCase().includes(searchLower) ||
           transaction.customerName?.toLowerCase().includes(searchLower);
  });

  const handleRetrieveOrder = (transaction: Transaction) => {
    setSelectedOrder(transaction);
  };

  const confirmRetrieval = () => {
    if (selectedOrder) {
      onRetrieveOrder(selectedOrder);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">استرجاع طلب</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-right"
                placeholder="بحث برقم الفاتورة أو اسم العميل..."
              />
            </div>
          </div>

          {/* Orders list */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الفاتورة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المبلغ
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className={`hover:bg-gray-50 ${
                      selectedOrder?.id === transaction.id ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.receiptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 ml-2" />
                        {formatDateTime(transaction.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.customerName || 'عميل عام'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRetrieveOrder(transaction)}
                        className={`text-red-800 hover:text-red-900 flex items-center ${
                          selectedOrder?.id === transaction.id ? 'font-bold' : ''
                        }`}
                      >
                        <Check size={18} className="ml-1" />
                        اختيار
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              لا توجد طلبات متطابقة مع البحث
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            إلغاء
          </button>

          <button
            onClick={confirmRetrieval}
            disabled={!selectedOrder}
            className={`flex-1 py-2 px-4 rounded-md ${
              !selectedOrder
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-800 text-white hover:bg-red-900'
            }`}
          >
            <div className="flex items-center justify-center">
              <Check size={18} className="ml-2" />
              استرجاع الطلب
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;