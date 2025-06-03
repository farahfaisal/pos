import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Package,
  Check,
  Save,
  FolderTree,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Product } from '../types/Product';
import { Category } from '../types/Category';
import { formatCurrency } from '../utils/formatters';
import { useProductImage } from '../hooks/useProductImage';
import ProductImageUpload from '../components/products/ProductImageUpload';
import * as woocommerce from '../lib/woocommerce';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    stockQuantity: 0,
    categoryId: '',
    barcode: '',
    description: '',
    costPrice: 0,
  });

  const { handleImageUpload, handleImageDelete, isUploading, error: imageError } = useProductImage();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const wooCategories = await woocommerce.getCategories();
      setCategories(wooCategories as Category[]);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('حدث خطأ أثناء تحميل التصنيفات');
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const wooProducts = await woocommerce.getProducts();
      setProducts(wooProducts as Product[]);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.price || !newProduct.categoryId) return;
      setError(null);

      const createdProduct = await woocommerce.createProduct(newProduct);
      setProducts([...products, createdProduct as Product]);

      setNewProduct({
        name: '',
        price: 0,
        stockQuantity: 0,
        categoryId: '',
        barcode: '',
        description: '',
        costPrice: 0,
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding product:', err);
      setError('حدث خطأ أثناء إضافة المنتج');
    }
  };

  const handleEditProduct = async () => {
    try {
      if (!selectedProduct) return;
      setError(null);

      const updatedProduct = await woocommerce.updateProduct(selectedProduct.id, selectedProduct);
      setProducts(products.map(product => 
        product.id === selectedProduct.id 
          ? updatedProduct as Product
          : product
      ));

      setSelectedProduct(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating product:', err);
      setError('حدث خطأ أثناء تحديث المنتج');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
      setError(null);

      const product = products.find(p => p.id === id);
      if (product?.imageUrl) {
        await handleImageDelete(id, product.imageUrl);
      }

      await woocommerce.deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('حدث خطأ أثناء حذف المنتج');
    }
  };

  const handleImageChange = async (file: File, productId: string) => {
    try {
      const imageUrl = await handleImageUpload(file, productId);
      if (imageUrl) {
        if (selectedProduct) {
          setSelectedProduct({ ...selectedProduct, imageUrl });
          await woocommerce.updateProduct(productId, { imageUrl });
        }
        setProducts(products.map(p => 
          p.id === productId ? { ...p, imageUrl } : p
        ));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  const handleRemoveImage = async (productId: string, imageUrl: string | null) => {
    try {
      await handleImageDelete(productId, imageUrl);
      if (selectedProduct) {
        setSelectedProduct({ ...selectedProduct, imageUrl: null });
        await woocommerce.updateProduct(productId, { imageUrl: null });
      }
      setProducts(products.map(p => 
        p.id === productId ? { ...p, imageUrl: null } : p
      ));
    } catch (err) {
      console.error('Error removing image:', err);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      
      await Promise.all([
        loadCategories(),
        loadProducts()
      ]);

      setIsSyncing(false);
    } catch (err) {
      console.error('Error syncing with WooCommerce:', err);
      setError('حدث خطأ أثناء المزامنة مع ووكومرس');
      setIsSyncing(false);
    }
  };

  const getCategoryName = (categoryId: string | undefined) => {
    if (!categoryId) return '-';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '-';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    const matchesCategory = !filterCategory || product.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <Layout title="إدارة المنتجات">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="إدارة المنتجات">
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
            placeholder="بحث عن منتج..."
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center py-2 px-4 border border-gray-300 rounded-md ${
              isSyncing 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RefreshCw size={18} className={`ml-2 ${isSyncing ? 'animate-spin' : ''}`} />
            مزامنة مع ووكومرس
          </button>

          <div className="relative">
            <button
              onClick={() => setFilterCategory(null)}
              className="flex items-center py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              <Filter size={18} className="ml-2" />
              <span>{filterCategory ? getCategoryName(filterCategory) : 'تصفية'}</span>
              {filterCategory && (
                <X
                  size={16} 
                  className="mr-1 text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterCategory(null);
                  }}
                />
              )}
            </button>
            
            {/* Filter dropdown */}
            {!filterCategory && categories.length > 0 && (
              <div className="absolute z-10 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setFilterCategory(category.id)}
                      className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={18} className="ml-2" />
            منتج جديد
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {imageError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {imageError}
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنتج
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التصنيف
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المخزون
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الباركود
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-4">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FolderTree size={16} className="text-gray-400 ml-2" />
                      <span className="text-sm text-gray-900">
                        {getCategoryName(product.categoryId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stockQuantity <= 5 
                        ? 'bg-red-100 text-red-800' 
                        : product.stockQuantity <= 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stockQuantity} وحدة
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.barcode || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 ml-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
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
        
        {filteredProducts.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            لا توجد منتجات متطابقة مع البحث
          </div>
        )}
      </div>
      
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">إضافة منتج جديد</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المنتج <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل اسم المنتج"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سعر البيع <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سعر التكلفة
                    </label>
                    <input
                      type="number"
                      value={newProduct.costPrice}
                      onChange={(e) => setNewProduct({...newProduct, costPrice: parseFloat(e.target.value)})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      التصنيف <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      required
                    >
                      <option value="">اختر التصنيف</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الكمية <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newProduct.stockQuantity}
                      onChange={(e) => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value)})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الباركود
                  </label>
                  <input
                    type="text"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل الباركود"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل وصف المنتج"
                    rows={2}
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
                onClick={handleAddProduct}
                disabled={!newProduct.name || !newProduct.price || !newProduct.categoryId || !newProduct.stockQuantity}
                className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !newProduct.name || !newProduct.price || !newProduct.categoryId || !newProduct.stockQuantity
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Save size={18} className="ml-2" />
                  حفظ المنتج
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">تعديل المنتج</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Product Image */}
                <ProductImageUpload
                  imageUrl={selectedProduct.imageUrl}
                  onImageUpload={(file) => handleImageChange(file, selectedProduct.id)}
                  onImageRemove={() => handleRemoveImage(selectedProduct.id, selectedProduct.imageUrl)}
                  isUploading={isUploading}
                  error={imageError}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المنتج <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل اسم المنتج"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سعر البيع <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.price}
                      onChange={(e) => setSelectedProduct({...selectedProduct, price: parseFloat(e.target.value)})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سعر التكلفة
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.costPrice}
                      onChange={(e) => setSelectedProduct({...selectedProduct, costPrice: parseFloat(e.target.value)})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      التصنيف <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedProduct.categoryId}
                      onChange={(e) => setSelectedProduct({...selectedProduct, categoryId: e.target.value})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      required
                    >
                      <option value="">اختر التصنيف</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الكمية <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.stockQuantity}
                      onChange={(e) => setSelectedProduct({...selectedProduct, stockQuantity: parseInt(e.target.value)})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الباركود
                  </label>
                  <input
                    type="text"
                    value={selectedProduct.barcode}
                    onChange={(e) => setSelectedProduct({...selectedProduct, barcode: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل الباركود"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={selectedProduct.description}
                    onChange={(e) => setSelectedProduct({...selectedProduct, description: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="أدخل وصف المنتج"
                    rows={2}
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
                onClick={handleEditProduct}
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

export default Products;