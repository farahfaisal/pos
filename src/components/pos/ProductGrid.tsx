import React from 'react';
import { Package } from 'lucide-react';
import { Product } from '../../types/Product';
import { formatCurrency } from '../../utils/formatters';

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onProductSelect,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="h-32 bg-gray-200 rounded-md mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {products.map(product => (
        <button
          key={product.id}
          onClick={() => onProductSelect(product)}
          className="bg-white border border-gray-200 rounded-lg p-4 text-center transition hover:shadow-lg hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <div className="h-32 flex items-center justify-center mb-3">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl}
                alt={product.name}
                className="h-32 w-32 object-contain rounded-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = "h-32 w-32 bg-gray-100 rounded-md flex items-center justify-center";
                    placeholder.innerHTML = '<svg class="h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><path d="M16 2v20"></path><path d="M7 8h.01"></path></svg>';
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="h-32 w-32 bg-gray-100 rounded-md flex items-center justify-center">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-lg font-bold text-red-800">
            {formatCurrency(product.price)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            المخزون: {product.stockQuantity}
          </p>
        </button>
      ))}

      {products.length === 0 && !isLoading && (
        <div className="col-span-full p-8 text-center text-gray-500">
          لا توجد منتجات متطابقة مع البحث
        </div>
      )}
    </div>
  );
};

export default ProductGrid;