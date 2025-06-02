import React from 'react';
import { X, Delete } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  onChange,
  onClear,
  onSubmit
}) => {
  const handleNumberClick = (num: string) => {
    if (value === '0') {
      onChange(num);
    } else {
      onChange(value + num);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1) || '0');
  };

  const handleDecimalPoint = () => {
    if (!value.includes('.')) {
      onChange(value + '.');
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="bg-white p-4 rounded mb-4 text-left">
        <span className="text-2xl font-bold">{value || '0'}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Numbers */}
        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className="bg-white text-xl font-bold p-4 rounded shadow hover:bg-gray-50 active:bg-gray-100"
          >
            {num}
          </button>
        ))}

        {/* Bottom row */}
        <button
          onClick={handleDecimalPoint}
          className="bg-white text-xl font-bold p-4 rounded shadow hover:bg-gray-50 active:bg-gray-100"
        >
          .
        </button>
        <button
          onClick={() => handleNumberClick('0')}
          className="bg-white text-xl font-bold p-4 rounded shadow hover:bg-gray-50 active:bg-gray-100"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="bg-yellow-100 text-yellow-800 p-4 rounded shadow hover:bg-yellow-200 active:bg-yellow-300 flex items-center justify-center"
        >
          <Delete size={24} />
        </button>

        {/* Action buttons */}
        <button
          onClick={onClear}
          className="col-span-1 bg-red-100 text-red-800 p-4 rounded shadow hover:bg-red-200 active:bg-red-300 flex items-center justify-center"
        >
          <X size={24} />
        </button>
        <button
          onClick={onSubmit}
          disabled={!value || value === '0'}
          className={`col-span-2 p-4 rounded shadow text-white font-bold ${
            !value || value === '0'
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-red-800 hover:bg-red-900 active:bg-red-950'
          }`}
        >
          تأكيد
        </button>
      </div>
    </div>
  );
};

export default NumericKeypad;