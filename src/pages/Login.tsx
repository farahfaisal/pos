import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Coffee, User, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Coffee size={40} className="text-red-800" />
            </div>
            
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              النور كافيه
            </h1>
            <p className="text-center text-gray-600">
              مرحباً بك في نظام إدارة المبيعات
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-right border border-red-100">
              <p className="font-medium">خطأ في تسجيل الدخول</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-right bg-white/50 backdrop-blur-sm"
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
                <User size={20} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 px-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-right bg-white/50 backdrop-blur-sm"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <Lock size={20} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
            </div>
            
            <button
              type="submit"
              className={`w-full py-3 px-4 bg-red-800 text-white rounded-lg font-medium shadow-lg hover:bg-red-900 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'جار تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 text-center mb-2">بيانات الدخول التجريبية:</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-center">مدير: admin@example.com / admin123</p>
                <p className="text-sm font-medium text-center">كاشير: cashier@example.com / cashier123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;