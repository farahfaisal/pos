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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Coffee size={32} className="text-amber-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            نور كافيه
          </h1>
          <p className="text-center text-gray-600 mb-6">
            قم بتسجيل الدخول للوصول إلى نظام نقطة البيع
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-right">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-right"
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
                <User size={18} className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-right"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <Lock size={18} className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            <button
              type="submit"
              className={`w-full py-2 px-4 bg-amber-600 text-white rounded-md font-medium ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-amber-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'جار تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>بيانات الدخول التجريبية:</p>
            <p className="font-medium mt-1">مدير: admin@example.com / admin123</p>
            <p className="font-medium">كاشير: cashier@example.com / cashier123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;