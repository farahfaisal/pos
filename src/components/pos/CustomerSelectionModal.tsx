import React, { useState } from 'react';
import { Search, X, Check, UserPlus } from 'lucide-react';
import { Customer } from '../../types/Customer';

interface CustomerSelectionModalProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  onClose: () => void;
  onAddNew: () => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  customers,
  onSelect,
  onClose,
  onAddNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return customer.name.toLowerCase().includes(searchLower) ||
           customer.phone?.toLowerCase().includes(searchLower) ||
           customer.email?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">اختيار العميل</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
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

            <button
              onClick={onAddNew}
              className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <UserPlus size={18} className="ml-2" />
              عميل جديد
            </button>
          </div>

          <div className="overflow-y-auto max-h-96">
            <div className="space-y-2">
              {filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => onSelect(customer)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-right flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    {customer.phone && (
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    )}
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.type === 'retail'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {customer.type === 'retail' ? 'مفرق' : 'جملة'}
                    </span>
                  </div>
                </button>
              ))}

              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا يوجد عملاء متطابقين مع البحث
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSelectionModal;