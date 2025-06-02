import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Save, 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Printer, 
  Sliders, 
  Languages,
  Key,
  Lock
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Settings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const [activeTab, setActiveTab] = useState<'store' | 'receipt' | 'security' | 'localization'>('store');
  
  const [storeSettings, setStoreSettings] = useState({
    name: 'شركة النصير للبورسلان',
    email: '',
    phone: '0597 672 268',
    address: 'عين يبرود -الشارع الرئيسي بحانب مدينة الطيبات, Ramallah, Palestine',
    logo: 'https://souqpale.com/wp-content/uploads/2025/04/441197348_122131506200246271_3808186221957484360_n-1.jpg',
    vat: '',
    website: '',
  });
  
  const [receiptSettings, setReceiptSettings] = useState({
    showLogo: true,
    showVAT: true,
    showAddress: true,
    showPhone: true,
    footerText: 'شكراً لتسوقكم معنا',
    receiptCopies: 1,
  });

  const [localizationSettings, setLocalizationSettings] = useState({
    language: 'ar',
    currency: 'ILS',
    dateFormat: 'dd/mm/yyyy',
    timezone: 'Asia/Jerusalem'
  });
  
  useEffect(() => {
    if (settings) {
      if (settings.store) {
        setStoreSettings(settings.store);
      }
      if (settings.receipt) {
        setReceiptSettings(settings.receipt);
      }
      if (settings.localization) {
        setLocalizationSettings(settings.localization);
      }
    }
  }, [settings]);
  
  const handleStoreSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleReceiptSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setReceiptSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocalizationSettingsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalizationSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      if (activeTab === 'store') {
        await updateSettings('store', storeSettings);
      } else if (activeTab === 'receipt') {
        await updateSettings('receipt', receiptSettings);
      } else if (activeTab === 'localization') {
        await updateSettings('localization', localizationSettings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout title="الإعدادات">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="الإعدادات">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-800 mb-4">الإعدادات</h2>
            
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('store')}
                className={`w-full flex items-center rounded-md p-3 ${
                  activeTab === 'store' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Building size={18} className="ml-3" />
                <span>معلومات المتجر</span>
              </button>
              
              <button
                onClick={() => setActiveTab('receipt')}
                className={`w-full flex items-center rounded-md p-3 ${
                  activeTab === 'receipt' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Printer size={18} className="ml-3" />
                <span>إعدادات الفاتورة</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center rounded-md p-3 ${
                  activeTab === 'security' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Lock size={18} className="ml-3" />
                <span>الأمان</span>
              </button>
              
              <button
                onClick={() => setActiveTab('localization')}
                className={`w-full flex items-center rounded-md p-3 ${
                  activeTab === 'localization' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Languages size={18} className="ml-3" />
                <span>الإعدادات المحلية</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Settings content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'store' && 'معلومات المتجر'}
                {activeTab === 'receipt' && 'إعدادات الفاتورة'}
                {activeTab === 'security' && 'إعدادات الأمان'}
                {activeTab === 'localization' && 'الإعدادات المحلية'}
              </h2>
            </div>
            
            <div className="p-6">
              {activeTab === 'store' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المتجر <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={storeSettings.name}
                        onChange={handleStoreSettingsChange}
                        className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                        required
                      />
                      <Building size={18} className="absolute right-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        البريد الإلكتروني
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={storeSettings.email}
                          onChange={handleStoreSettingsChange}
                          className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                        />
                        <Mail size={18} className="absolute right-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الهاتف
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="phone"
                          value={storeSettings.phone}
                          onChange={handleStoreSettingsChange}
                          className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                        />
                        <Phone size={18} className="absolute right-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العنوان
                    </label>
                    <div className="relative">
                      <textarea
                        name="address"
                        value={storeSettings.address}
                        onChange={handleStoreSettingsChange}
                        className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                        rows={2}
                      />
                      <MapPin size={18} className="absolute right-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الرقم الضريبي
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="vat"
                          value={storeSettings.vat}
                          onChange={handleStoreSettingsChange}
                          className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                        />
                        <Key size={18} className="absolute right-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الموقع الإلكتروني
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="website"
                          value={storeSettings.website}
                          onChange={handleStoreSettingsChange}
                          className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                        />
                        <Globe size={18} className="absolute right-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شعار المتجر
                    </label>
                    {storeSettings.logo ? (
                      <div className="mt-2">
                        <img 
                          src={storeSettings.logo} 
                          alt="شعار المتجر" 
                          className="h-32 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <div className="mx-auto h-12 w-12 text-gray-400">
                            <Building size={48} />
                          </div>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                            >
                              <span>أضف صورة</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                            </label>
                            <p className="pr-1">أو اسحب وأفلت</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG، JPG حتى 2MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'receipt' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نص تذييل الفاتورة
                    </label>
                    <textarea
                      name="footerText"
                      value={receiptSettings.footerText}
                      onChange={handleReceiptSettingsChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد نسخ الفاتورة
                    </label>
                    <input
                      type="number"
                      name="receiptCopies"
                      value={receiptSettings.receiptCopies}
                      onChange={handleReceiptSettingsChange}
                      className="block w-24 py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                      min="1"
                      max="3"
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-2">محتوى الفاتورة</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="showLogo"
                          name="showLogo"
                          type="checkbox"
                          checked={receiptSettings.showLogo}
                          onChange={handleReceiptSettingsChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                        />
                        <label htmlFor="showLogo" className="text-sm text-gray-700">
                          إظهار شعار المتجر
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="showVAT"
                          name="showVAT"
                          type="checkbox"
                          checked={receiptSettings.showVAT}
                          onChange={handleReceiptSettingsChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                        />
                        <label htmlFor="showVAT" className="text-sm text-gray-700">
                          إظهار الرقم الضريبي
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="showAddress"
                          name="showAddress"
                          type="checkbox"
                          checked={receiptSettings.showAddress}
                          onChange={handleReceiptSettingsChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                        />
                        <label htmlFor="showAddress" className="text-sm text-gray-700">
                          إظهار عنوان المتجر
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="showPhone"
                          name="showPhone"
                          type="checkbox"
                          checked={receiptSettings.showPhone}
                          onChange={handleReceiptSettingsChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                        />
                        <label htmlFor="showPhone" className="text-sm text-gray-700">
                          إظهار رقم الهاتف
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-2">تغيير كلمة المرور</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          كلمة المرور الحالية <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                            placeholder="أدخل كلمة المرور الحالية"
                            required
                          />
                          <Lock size={18} className="absolute right-3 top-2.5 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          كلمة المرور الجديدة <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                            placeholder="أدخل كلمة المرور الجديدة"
                            required
                          />
                          <Lock size={18} className="absolute right-3 top-2.5 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          تأكيد كلمة المرور الجديدة <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                            placeholder="أدخل كلمة المرور مرة أخرى"
                            required
                          />
                          <Lock size={18} className="absolute right-3 top-2.5 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Key size={16} className="ml-2" />
                          تغيير كلمة المرور
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-2">إعدادات الجلسة</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="autoLogout"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                        />
                        <label htmlFor="autoLogout" className="text-sm text-gray-700">
                          تسجيل الخروج تلقائياً بعد فترة من عدم النشاط
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="requireAuth"
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                        />
                        <label htmlFor="requireAuth" className="text-sm text-gray-700">
                          طلب تأكيد كلمة المرور عند إجراء تغييرات مهمة
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'localization' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اللغة
                    </label>
                    <select 
                      name="language"
                      value={localizationSettings.language}
                      onChange={handleLocalizationSettingsChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">الإنجليزية</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العملة
                    </label>
                    <select 
                      name="currency"
                      value={localizationSettings.currency}
                      onChange={handleLocalizationSettingsChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    >
                      <option value="ILS">شيكل إسرائيلي (₪)</option>
                      <option value="SAR">ريال سعودي (ر.س)</option>
                      <option value="USD">دولار أمريكي ($)</option>
                      <option value="EUR">يورو (€)</option>
                      <option value="AED">درهم إماراتي (د.إ)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تنسيق التاريخ
                    </label>
                    <select 
                      name="dateFormat"
                      value={localizationSettings.dateFormat}
                      onChange={handleLocalizationSettingsChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    >
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy/mm/dd">YYYY/MM/DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المنطقة الزمنية
                    </label>
                    <select 
                      name="timezone"
                      value={localizationSettings.timezone}
                      onChange={handleLocalizationSettingsChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                    >
                      <option value="Asia/Gaza">غزة (GMT+2)</option>
                      <option value="Asia/Hebron">الخليل (GMT+2)</option>
                      <option value="Asia/Jerusalem">القدس (GMT+2)</option>
                      <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                      <option value="Asia/Dubai">دبي (GMT+4)</option>
                      <option value="Asia/Baghdad">بغداد (GMT+3)</option>
                      <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save size={16} className="ml-2" />
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;