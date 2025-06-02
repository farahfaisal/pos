import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';

interface TopBarProps {
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { user } = useAuth();
  
  return (
    <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      
      <div className="flex items-center">
        <div className="mr-4 text-right">
          <p className="font-medium text-sm">{user?.name}</p>
          <p className="text-xs text-gray-500">
            {user?.role === 'admin' ? 'مدير النظام' : 'أمين الصندوق'}
          </p>
        </div>
        
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="rounded-full" />
          ) : (
            <User size={20} className="text-blue-600" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;