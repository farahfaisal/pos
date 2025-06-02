import React, { useState } from 'react';
import { X, Save, Printer } from 'lucide-react';
import BarcodeGenerator from './BarcodeGenerator';
import { BarcodeFormat } from '@zxing/library';

interface BarcodeGeneratorModalProps {
  onClose: () => void;
  value: string;
  productName?: string;
}

const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  onClose,
  value,
  productName
}) => {
  const [copies, setCopies] = useState(1);
  const [format, setFormat] = useState<BarcodeFormat>(BarcodeFormat.CODE_128);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">إنشاء باركود</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {productName && (
              <div className="text-center font-medium text-gray-800">
                {productName}
              </div>
            )}
            
            <div className="flex justify-center">
              <BarcodeGenerator 
                value={value}
                format={format}
                width={250}
                height={100}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الباركود
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(Number(e.target.value))}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              >
                <option value={BarcodeFormat.CODE_128}>Code 128</option>
                <option value={BarcodeFormat.EAN_13}>EAN-13</option>
                <option value={BarcodeFormat.CODE_39}>Code 39</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عدد النسخ
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value))}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            إلغاء
          </button>
          
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            <Printer size={18} className="ml-2" />
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeGeneratorModal;