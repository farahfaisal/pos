import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package,
  FolderTree,
  Users, 
  BarChart2, 
  Settings, 
  LogOut,
  UserCircle,
  CreditCard,
  Coffee
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { logout, isAdmin } = useAuth();
  
  const navItems = [
    {
      name: 'نقطة البيع',
      path: '/pos',
      icon: <ShoppingCart size={20} />,
      allowedRoles: ['admin', 'cashier'],
    },
    {
      name: 'لوحة التحكم',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      allowedRoles: ['admin', 'cashier', 'inventory'],
    },
    {
      name: 'المنتجات',
      path: '/products',
      icon: <Package size={20} />,
      allowedRoles: ['admin', 'inventory'],
    },
    {
      name: 'التصنيفات',
      path: '/categories',
      icon: <FolderTree size={20} />,
      allowedRoles: ['admin', 'inventory'],
    },
    {
      name: 'العملاء',
      path: '/customers',
      icon: <UserCircle size={20} />,
      allowedRoles: ['admin', 'cashier'],
    },
    {
      name: 'حسابات العملاء',
      path: '/accounts',
      icon: <CreditCard size={20} />,
      allowedRoles: ['admin', 'cashier'],
    },
    {
      name: 'المستخدمين',
      path: '/users',
      icon: <Users size={20} />,
      allowedRoles: ['admin'],
    },
    {
      name: 'التقارير',
      path: '/reports',
      icon: <BarChart2 size={20} />,
      allowedRoles: ['admin'],
    },
    {
      name: 'الإعدادات',
      path: '/settings',
      icon: <Settings size={20} />,
      allowedRoles: ['admin'],
    },
  ];
  
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Coffee size={24} className="text-amber-600" />
          <h1 className="text-xl font-bold text-gray-800">نور كافيه</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          // Only show items for admin or if allowed for user's role
          if (!isAdmin && !item.allowedRoles.includes('cashier')) {
            return null;
          }
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="ml-3">{item.icon}</span>
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <LogOut size={20} className="ml-3" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default Sidebar;