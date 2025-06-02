import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import BarcodeScanner from '../components/pos/BarcodeScanner';
import CategoryTabs from '../components/pos/CategoryTabs';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import PaymentForm from '../components/pos/PaymentForm';
import CashDrawer from '../components/pos/CashDrawer';
import DailyReport from '../components/pos/DailyReport';
import OrdersModal from '../components/pos/OrdersModal';
import CustomerSelectionModal from '../components/pos/CustomerSelectionModal';
import { Product, CartItem } from '../types/Product';
import { Customer } from '../types/Customer';
import { Category } from '../types/Category';
import { Transaction } from '../types/Transaction';
import { CashDrawerSession } from '../types/CashDrawer';
import { History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const POS: React.FC = () => {
  const { canManageCashDrawer } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [drawerSession, setDrawerSession] = useState<CashDrawerSession | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      setCategories(data.map(category => ({
        ...category,
        createdAt: new Date(category.created_at),
        updatedAt: new Date(category.updated_at)
      })));
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('حدث خطأ أثناء تحميل التصنيفات');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      setProducts(data.map(product => ({
        ...product,
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at)
      })));
    } catch (err) {
      console.error('Error loading products:', err);
      setError('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
    }
  };

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePaymentComplete = () => {
    clearCart();
    setShowPaymentForm(false);
  };

  const retrieveOrder = (transaction: Transaction) => {
    const items: CartItem[] = transaction.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      return {
        ...product,
        quantity: item.quantity
      };
    });

    setCartItems(items);
    setShowOrdersModal(false);
  };

  const handleOpenDrawer = (amount: number) => {
    const session: CashDrawerSession = {
      id: Math.random().toString(36).substring(2),
      openingBalance: amount,
      openedAt: new Date(),
      openedBy: 'current-user-id',
      status: 'open'
    };
    setDrawerSession(session);
  };

  const handleCloseDrawer = (amount: number, notes?: string) => {
    if (!drawerSession) return;

    setDrawerSession({
      ...drawerSession,
      closingBalance: amount,
      closedAt: new Date(),
      closedBy: 'current-user-id',
      notes,
      status: 'closed'
    });

    setShowDailyReport(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
  };

  const handleAddNewCustomer = () => {
    navigate('/customers?action=add');
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory)
    : products;

  return (
    <Layout title="نقطة البيع">
      <div className="h-full flex gap-6">
        {/* Products section */}
        <div className="flex-1 flex flex-col bg-gray-50 rounded-lg overflow-hidden">
          <div className="p-4 bg-white border-b">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowOrdersModal(true)}
                className="flex items-center px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900"
              >
                <History size={18} className="ml-2" />
                استرجاع طلب
              </button>
            </div>
            <BarcodeScanner onScan={handleBarcodeScan} />
          </div>

          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            isLoading={isLoadingCategories}
          />

          <div className="flex-1 overflow-auto">
            {error && (
              <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}

            <ProductGrid
              products={filteredProducts}
              onProductSelect={addToCart}
              isLoading={isLoadingProducts}
            />
          </div>
        </div>

        {/* Cart and Cash Drawer section */}
        <div className="w-96 space-y-4">
          <Cart
            items={cartItems}
            selectedCustomer={selectedCustomer}
            onUpdateQuantity={updateCartItemQuantity}
            onRemoveItem={removeFromCart}
            onSelectCustomer={() => setShowCustomerModal(true)}
            onRemoveCustomer={() => setSelectedCustomer(null)}
            onCheckout={() => setShowPaymentForm(true)}
            onClear={clearCart}
          />

          {canManageCashDrawer && (
            <CashDrawer
              session={drawerSession}
              onOpen={handleOpenDrawer}
              onClose={handleCloseDrawer}
              cashTransactions={0}
            />
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentForm && canManageCashDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PaymentForm
            total={calculateTotal()}
            items={cartItems}
            customer={selectedCustomer}
            onPaymentComplete={handlePaymentComplete}
            onCancel={() => setShowPaymentForm(false)}
          />
        </div>
      )}

      {/* Orders Modal */}
      {showOrdersModal && (
        <OrdersModal
          transactions={transactions}
          onClose={() => setShowOrdersModal(false)}
          onRetrieveOrder={retrieveOrder}
        />
      )}

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <CustomerSelectionModal
          customers={[]} // Replace with actual customers data
          onSelect={handleSelectCustomer}
          onClose={() => setShowCustomerModal(false)}
          onAddNew={handleAddNewCustomer}
        />
      )}

      {/* Daily Report Modal */}
      {showDailyReport && drawerSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <DailyReport
              date={drawerSession.openedAt}
              openingBalance={drawerSession.openingBalance}
              closingBalance={drawerSession.closingBalance || 0}
              sales={{
                cash: 5000,
                card: 3000,
                mobile: 2000
              }}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default POS;