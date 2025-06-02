import React, { useState, useEffect, useRef } from 'react';
import { Search, Barcode } from 'lucide-react';
import NumericKeypad from './NumericKeypad';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout>();
  const barcodeBufferRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  useEffect(() => {
    // Focus the input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (showKeypad) return;

      const currentTime = Date.now();
      const timeDiff = currentTime - lastScanTimeRef.current;

      // If it's been more than 50ms since the last keypress, start a new barcode
      if (timeDiff > 50) {
        barcodeBufferRef.current = '';
      }

      // Update the last scan time
      lastScanTimeRef.current = currentTime;

      // Add the character to the buffer
      if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }

      // If Enter is pressed or we have a complete barcode
      if (e.key === 'Enter' || barcodeBufferRef.current.length >= 8) {
        if (barcodeBufferRef.current) {
          onScan(barcodeBufferRef.current);
          barcodeBufferRef.current = '';
          setBarcode('');
        }
      }

      // Clear the buffer after a delay
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      scanTimeoutRef.current = setTimeout(() => {
        barcodeBufferRef.current = '';
      }, 50);
    };

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [onScan, showKeypad]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);

    // Support for various barcode formats
    const barcodeRegex = /^[0-9A-Z\-\.\/\+]{8,}$/i;
    if (barcodeRegex.test(value)) {
      onScan(value);
      setBarcode('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeypadSubmit = () => {
    if (barcode) {
      onScan(barcode);
      setBarcode('');
    }
    setShowKeypad(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={barcode}
            onChange={handleInputChange}
            className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-right"
            placeholder="امسح الباركود أو ابحث عن منتج..."
          />
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 flex items-center"
          onClick={() => setShowKeypad(true)}
        >
          <Barcode size={18} className="ml-2" />
          إدخال
        </button>
      </div>

      {/* Numeric Keypad Modal */}
      {showKeypad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4">
              <NumericKeypad
                value={barcode}
                onChange={setBarcode}
                onClear={() => setBarcode('')}
                onSubmit={handleKeypadSubmit}
              />
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowKeypad(false)}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;