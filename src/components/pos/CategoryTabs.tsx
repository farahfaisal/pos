import React from 'react';
import { Category } from '../../types/Category';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  isLoading?: boolean;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex overflow-x-auto py-2 px-4 space-x-2 space-x-reverse border-b bg-white">
        <div className="animate-pulse flex space-x-2 space-x-reverse">
          <div className="h-10 w-20 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-28 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto py-2 px-4 space-x-2 space-x-reverse border-b bg-white">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
          activeCategory === null
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        الكل
      </button>
      
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
            activeCategory === category.id
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;