import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  User,
  Package,
  Check,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { Customer, CustomerType } from '../types/Customer';
import { formatCurrency, formatDate } from '../utils/formatters';
import { supabase } from '../lib/supabase';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    type: 'retail',
    discount: undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadCustomers();
  }, []);
  
  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;

      setCustomers(data.map(customer => ({
        ...customer,
        type: customer.type as CustomerType,
        discount: customer.discount_type ? {
          type: customer.discount_type,
          value: customer.discount_value || 0
        } : undefined,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
        lastVisit: customer.last_visit ? new Date(customer.last_visit) : undefined
      })));
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('حدث خطأ أثناء تحميل العملاء');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCustomer = async () => {
    try {
      if (!newCustomer.name || !newCustomer.type) return;
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email,
          type: newCustomer.type,
          discount_type: newCustomer.discount?.type,
          discount_value: newCustomer.discount?.value,
          total_purchases: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setCustomers([...customers, {
        ...data,
        type: data.type as CustomerType,
        discount: data.discount_type ? {
          type: data.discount_type,
          value: data.discount_value || 0
        } : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }]);

      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        type: 'retail',
        discount: undefined,
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding customer:', err);
      setError('حدث خطأ أثناء إضافة العميل');
    }
  };
  
  const handleEditCustomer = async () => {
    try {
      if (!selectedCustomer) return;
      setError(null);

      const { error } = await supabase
        .from('customers')
        .update({
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email,
          type: selectedCustomer.type,
          discount_type: selectedCustomer.discount?.type,
          discount_value: selectedCustomer.discount?.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      setCustomers(customers.map(customer => 
        customer.id === selectedCustomer.id 
          ? { ...selectedCustomer, updatedAt: new Date() }
          : customer
      ));

      setSelectedCustomer(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating customer:', err);
      setError('حدث خطأ أثناء تحديث العميل');
    }
  };
  
  const handleDeleteCustomer = async (id: string) => {
    try {
      if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
      setError(null);

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(customers.filter(customer => customer.id !== id));
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('حدث خطأ أثناء حذف العميل');
    }
  };
  
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return customer.name.toLowerCase().includes(searchLower) ||
           customer.phone?.toLowerCase().includes(searchLower) ||
           customer.email?.toLowerCase().includes(searchLower);
  });

  if (isLoading) {
    return (
      <Layout title="إدارة العملاء">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="إدارة العملاء">
      {/* Top actions */}
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
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus size={18} className="ml-2" />
          إضافة عميل جديد
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {/* Customers table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الخصم
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجمالي المشتريات
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر زيارة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 ml-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          customer.type === 'retail' 
                            ? 'bg-blue-100' 
                            : 'bg-green-100'
                        }`}>
                          {customer.type === 'retail' 
                            ? <User className="h-6 w-6 text-blue-600" />
                            : <Package className="h-6 w-6 text-green-600" />
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone size={14} className="ml-1" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail size={14} className="ml-1" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.type === 'retail'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {customer.type === 'retail' ? 'مفرق' : 'جملة'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {customer.discount ? (
                      <span className="text-green-600 font-medium">
                        {customer.discount.type === 'percentage'
                          ? `${customer.discount.value}%`
                          : formatCurrency(customer.discount.value)
                        }
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(customer.totalPurchases)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastVisit ? formatDate(customer.lastVisit) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 ml-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            لا يوجد عملاء متطابقين مع البحث
          </div>
        )}
      </div>
      
      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">إضافة عميل جديد</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل اسم العميل"
                      required
                    />
                    <User size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل رقم الهاتف"
                    />
                    <Phone size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل البريد الإلكتروني"
                    />
                    <Mail size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع العميل <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setNewCustomer({...newCustomer, type: 'retail'})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        newCustomer.type === 'retail'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <User className={`h-6 w-6 ${
                        newCustomer.type === 'retail' ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">مفرق</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setNewCustomer({...newCustomer, type: 'wholesale'})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        newCustomer.type === 'wholesale'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <Package className={`h-6 w-6 ${
                        newCustomer.type === 'wholesale' ? 'text-green-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">جملة</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    خصم دائم
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="discountType"
                          checked={newCustomer.discount?.type === 'percentage'}
                          onChange={() => setNewCustomer({
                            ...newCustomer,
                            discount: { type: 'percentage', value: newCustomer.discount?.value || 0 }
                          })}
                          className="ml-1"
                        />
                        نسبة مئوية
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="discountType"
                          checked={newCustomer.discount?.type === 'fixed'}
                          onChange={() => setNewCustomer({
                            ...newCustomer,
                            discount: { type: 'fixed', value: newCustomer.discount?.value || 0 }
                          })}
                          className="ml-1"
                        />
                        مبلغ ثابت
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={newCustomer.discount?.value || ''}
                        onChange={(e) => setNewCustomer({
                          ...newCustomer,
                          discount: {
                            type: newCustomer.discount?.type || 'percentage',
                            value: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full border rounded p-2 text-center"
                        placeholder={newCustomer.discount?.type === 'percentage' ? '%' : '0.00'}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <div className="relative">
                    <textarea
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
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
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                إلغاء
              </button>
              
              <button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name}
                className={`flex-1 py-2 px-4 rounded-md ${
                  !newCustomer.name
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Check size={18} className="ml-2" />
                  إضافة العميل
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">تعديل العميل</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedCustomer.name}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل اسم العميل"
                      required
                    />
                    <User size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={selectedCustomer.phone}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, phone: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل رقم الهاتف"
                    />
                    <Phone size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={selectedCustomer.email}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل البريد الإلكتروني"
                    />
                    <Mail size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع العميل <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer({...selectedCustomer, type: 'retail'})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        selectedCustomer.type === 'retail'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <User className={`h-6 w-6 ${
                        selectedCustomer.type === 'retail' ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">مفرق</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer({...selectedCustomer, type: 'wholesale'})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        selectedCustomer.type === 'wholesale'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <Package className={`h-6 w-6 ${
                        selectedCustomer.type === 'wholesale' ? 'text-green-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">جملة</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    خصم دائم
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="discountType"
                          checked={selectedCustomer.discount?.type === 'percentage'}
                          onChange={() => setSelectedCustomer({
                            ...selectedCustomer,
                            discount: { type: 'percentage', value: selectedCustomer.discount?.value || 0 }
                          })}
                          className="ml-1"
                        />
                        نسبة مئوية
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="discountType"
                          checked={selectedCustomer.discount?.type === 'fixed'}
                          onChange={() => setSelectedCustomer({
                            ...selectedCustomer,
                            discount: { type: 'fixed', value: selectedCustomer.discount?.value || 0 }
                          })}
                          className="ml-1"
                        />
                        مبلغ ثابت
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={selectedCustomer.discount?.value || ''}
                        onChange={(e) => setSelectedCustomer({
                          ...selectedCustomer,
                          discount: {
                            type: selectedCustomer.discount?.type || 'percentage',
                            value: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full border rounded p-2 text-center"
                        placeholder={selectedCustomer.discount?.type === 'percentage' ? '%' : '0.00'}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <div className="relative">
                    <textarea
                      value={selectedCustomer.notes}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, notes: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
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
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                إلغاء
              </button>
              
              <button
                onClick={handleEditCustomer}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <div className="flex items-center justify-center">
                  <Check size={18} className="ml-2" />
                  حفظ التغييرات
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Customers;