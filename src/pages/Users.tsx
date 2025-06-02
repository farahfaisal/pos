import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  User,
  UserPlus,
  Shield,
  Package,
  Check,
  Mail,
  Key
} from 'lucide-react';
import { UserRole, User as UserType } from '../types/User';

// Mock users data
const mockUsers: UserType[] = [
  {
    id: '1',
    name: 'مدير النظام',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  },
  {
    id: '2',
    name: 'أمين الصندوق',
    email: 'cashier@example.com',
    role: UserRole.CASHIER,
  },
  {
    id: '3',
    name: 'محمد أحمد',
    email: 'mohammed@example.com',
    role: UserRole.CASHIER,
  },
  {
    id: '4',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    role: UserRole.INVENTORY,
  },
  {
    id: '5',
    name: 'عبدالله خالد',
    email: 'abdullah@example.com',
    role: UserRole.CASHIER,
  },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [newUser, setNewUser] = useState<Partial<UserType>>({
    name: '',
    email: '',
    role: UserRole.CASHIER,
  });
  
  useEffect(() => {
    // In a real app, you would fetch users from an API
    setUsers(mockUsers);
  }, []);
  
  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const handleAddUser = () => {
    const id = Math.random().toString(36).substring(2, 9);
    
    const user: UserType = {
      id,
      name: newUser.name || '',
      email: newUser.email || '',
      role: newUser.role || UserRole.CASHIER,
    };
    
    setUsers([...users, user]);
    setNewUser({
      name: '',
      email: '',
      role: UserRole.CASHIER,
    });
    setShowAddModal(false);
  };
  
  const handleEditUser = () => {
    if (!selectedUser) return;
    
    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return selectedUser;
      }
      return user;
    });
    
    setUsers(updatedUsers);
    setSelectedUser(null);
    setShowEditModal(false);
  };
  
  const handleDeleteUser = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };
  
  const openEditModal = (user: UserType) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };
  
  return (
    <Layout title="إدارة المستخدمين">
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
            placeholder="بحث عن مستخدم..."
          />
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto"
        >
          <UserPlus size={18} className="ml-2" />
          إضافة مستخدم جديد
        </button>
      </div>
      
      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 ml-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          user.role === UserRole.ADMIN 
                            ? 'bg-purple-100' 
                            : user.role === UserRole.CASHIER
                              ? 'bg-blue-100'
                              : 'bg-green-100'
                        }`}>
                          <User className={`h-6 w-6 ${
                            user.role === UserRole.ADMIN 
                              ? 'text-purple-600' 
                              : user.role === UserRole.CASHIER
                                ? 'text-blue-600'
                                : 'text-green-600'
                          }`} />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === UserRole.ADMIN 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === UserRole.CASHIER
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === UserRole.ADMIN 
                        ? 'مدير النظام' 
                        : user.role === UserRole.CASHIER
                          ? 'أمين صندوق'
                          : 'مسؤول مخزون'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-900 ml-3"
                    >
                      <Edit size={18} />
                    </button>
                    {user.id !== '1' && ( // Prevent deleting the main admin
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            لا يوجد مستخدمين متطابقين مع البحث
          </div>
        )}
      </div>
      
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">إضافة مستخدم جديد</h2>
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
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل اسم المستخدم"
                      required
                    />
                    <User size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل البريد الإلكتروني"
                      required
                    />
                    <Mail size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <Key size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تأكيد كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل كلمة المرور مرة أخرى"
                      required
                    />
                    <Key size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setNewUser({...newUser, role: UserRole.CASHIER})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        newUser.role === UserRole.CASHIER
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <User className={`h-6 w-6 ${
                        newUser.role === UserRole.CASHIER ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">أمين صندوق</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setNewUser({...newUser, role: UserRole.INVENTORY})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        newUser.role === UserRole.INVENTORY
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <Package className={`h-6 w-6 ${
                        newUser.role === UserRole.INVENTORY ? 'text-green-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">مسؤول مخزون</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setNewUser({...newUser, role: UserRole.ADMIN})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        newUser.role === UserRole.ADMIN
                          ? 'bg-purple-50 border-purple-500 text-purple-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <Shield className={`h-6 w-6 ${
                        newUser.role === UserRole.ADMIN ? 'text-purple-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">مدير النظام</span>
                    </button>
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
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email}
                className={`flex-1 py-2 px-4 rounded-md ${
                  !newUser.name || !newUser.email
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Check size={18} className="ml-2" />
                  إضافة المستخدم
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">تعديل المستخدم</h2>
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
                      value={selectedUser.name}
                      onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل اسم المستخدم"
                      required
                    />
                    <User size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="أدخل البريد الإلكتروني"
                      required
                    />
                    <Mail size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="اترك فارغاً للإبقاء على كلمة المرور الحالية"
                    />
                    <Key size={18} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUser({...selectedUser, role: UserRole.CASHIER})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        selectedUser.role === UserRole.CASHIER
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <User className={`h-6 w-6 ${
                        selectedUser.role === UserRole.CASHIER ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">أمين صندوق</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedUser({...selectedUser, role: UserRole.INVENTORY})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        selectedUser.role === UserRole.INVENTORY
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <Package className={`h-6 w-6 ${
                        selectedUser.role === UserRole.INVENTORY ? 'text-green-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">مسؤول مخزون</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedUser({...selectedUser, role: UserRole.ADMIN})}
                      className={`border rounded-md py-3 px-3 flex flex-col items-center ${
                        selectedUser.role === UserRole.ADMIN
                          ? 'bg-purple-50 border-purple-500 text-purple-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <Shield className={`h-6 w-6 ${
                        selectedUser.role === UserRole.ADMIN ? 'text-purple-600' : 'text-gray-500'
                      }`} />
                      <span className="mt-2 text-sm font-medium">مدير النظام</span>
                    </button>
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
                onClick={handleEditUser}
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

export default Users;