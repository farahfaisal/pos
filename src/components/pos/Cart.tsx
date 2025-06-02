import React from 'react';
import { Plus, Minus, Trash2, User, Package } from 'lucide-react';
import { CartItem } from '../../types/Product';
import { Customer } from '../../types/Customer';
import { formatCurrency } from '../../utils/formatters';

interface CartProps {
  items: CartItem[];
  selectedCustomer: Customer | null;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onSelectCustomer: () => void;
  onRemoveCustomer: () => void;
  onCheckout: () => void;
  onClear: () => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  selectedCustomer,
  onUpdateQuantity,
  onRemoveItem,
  onSelectCustomer,
  onRemoveCustomer,
  onCheckout,
  onClear,
}) => {
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-[500px]">
      <div className="p-3 border-b">
        <h2 className="text-lg font-semibold text-gray-800">سلة المشتريات</h2>
      </div>

      {/* Customer selection */}
      <div className="p-2 border-b">
        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-red-50 p-2 rounded-lg">
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ml-2 ${
                selectedCustomer.type === 'retail' 
                  ? 'bg-red-100' 
                  : 'bg-green-100'
              }`}>
                {selectedCustomer.type === 'retail' 
                  ? <User className="h-5 w-5 text-red-800" />
                  : <Package className="h-5 w-5 text-green-600" />
                }
              </div>
              <div>
                <div className="font-medium text-sm">{selectedCustomer.name}</div>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
                  selectedCustomer.type === 'retail'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {selectedCustomer.type === 'retail' ? 'مفرق' : 'جملة'}
                </div>
              </div>
            </div>
            <button
              onClick={onRemoveCustomer}
              className="text-red-800 hover:text-red-900"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onSelectCustomer}
            className="w-full py-1.5 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
          >
            اختيار العميل
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm">السلة فارغة</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-xs text-gray-600">{formatCurrency(item.price)}</p>
                </div>

                <div className="flex items-center space-x-1 space-x-reverse">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="w-6 text-center text-sm font-medium">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded-full text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart summary */}
      <div className="p-3 border-t bg-gray-50">
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>عدد المنتجات:</span>
            <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>الإجمالي:</span>
            <span>{formatCurrency(calculateTotal())}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onClear}
            className="py-2 px-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm"
          >
            مسح السلة
          </button>

          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className={`py-2 px-3 rounded-md text-sm ${
              items.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            الدفع
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;