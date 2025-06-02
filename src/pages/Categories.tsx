import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Check,
  FileText
} from 'lucide-react';
import { Category } from '../types/Category';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Categories: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name) return;
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.name,
          description: newCategory.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }]);

      setNewCategory({
        name: '',
        description: '',
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('حدث خطأ أثناء إضافة التصنيف');
    }
  };

  const handleEditCategory = async () => {
    try {
      if (!selectedCategory) return;
      setError(null);

      const { error } = await supabase
        .from('categories')
        .update({
          name: selectedCategory.name,
          description: selectedCategory.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCategory.id);

      if (error) throw error;

      setCategories(categories.map(category => 
        category.id === selectedCategory.id 
          ? { ...selectedCategory, updatedAt: new Date() }
          : category
      ));

      setSelectedCategory(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('حدث خطأ أثناء تحديث التصنيف');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
      setError(null);

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(category => category.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('حدث خطأ أثناء حذف التصنيف');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="إدارة التصنيفات">
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
            placeholder="بحث عن تصنيف..."
          />
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus size={18} className="ml-2" />
          إضافة تصنيف جديد
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {/* Categories table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التصنيف
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 ml-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
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
        
        {filteredCategories.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            لا توجد تصنيفات متطابقة مع البحث
          </div>
        )}
      </div>
      
      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">إضافة تصنيف جديد</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم التصنيف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل اسم التصنيف"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل وصف التصنيف"
                    rows={3}
                  />
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
                onClick={handleAddCategory}
                disabled={!newCategory.name}
                className={`flex-1 py-2 px-4 rounded-md ${
                  !newCategory.name
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Check size={18} className="ml-2" />
                  إضافة التصنيف
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">تعديل التصنيف</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم التصنيف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedCategory.name}
                    onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل اسم التصنيف"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={selectedCategory.description}
                    onChange={(e) => setSelectedCategory({...selectedCategory, description: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل وصف التصنيف"
                    rows={3}
                  />
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
                onClick={handleEditCategory}
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

export default Categories;