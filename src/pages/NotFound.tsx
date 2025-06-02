import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mt-2">
          عذراً، الصفحة التي تبحث عنها غير موجودة.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Home size={18} className="ml-2" />
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;