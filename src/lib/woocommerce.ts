import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { Product } from "../types/Product";
import { Category } from "../types/Category";
import { Transaction } from "../types/Transaction";

// Initialize the WooCommerce API
const api = new WooCommerceRestApi({
  url: import.meta.env.VITE_WP_URL,
  consumerKey: import.meta.env.VITE_WC_CONSUMER_KEY,
  consumerSecret: import.meta.env.VITE_WC_CONSUMER_SECRET,
  version: "wc/v3"
});

// Convert WooCommerce product to POS product
const convertWooProduct = (wooProduct: any): Partial<Product> => ({
  id: wooProduct.id.toString(),
  name: wooProduct.name,
  barcode: wooProduct.sku,
  price: parseFloat(wooProduct.price),
  stockQuantity: wooProduct.stock_quantity || 0,
  categoryId: wooProduct.categories[0]?.id.toString(),
  description: wooProduct.description,
  imageUrl: wooProduct.images[0]?.src,
  costPrice: parseFloat(wooProduct.meta_data.find((m: any) => m.key === '_cost_price')?.value || '0'),
});

// Convert WooCommerce category to POS category
const convertWooCategory = (wooCategory: any): Partial<Category> => ({
  id: wooCategory.id.toString(),
  name: wooCategory.name,
  description: wooCategory.description,
});

// Products
export const getProducts = async (): Promise<Partial<Product>[]> => {
  try {
    const response = await api.get("products", {
      per_page: 100,
    });
    return response.data.map(convertWooProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const createProduct = async (productData: Partial<Product>) => {
  try {
    const wooProduct = {
      name: productData.name,
      type: "simple",
      regular_price: productData.price?.toString(),
      description: productData.description,
      sku: productData.barcode,
      manage_stock: true,
      stock_quantity: productData.stockQuantity,
      categories: productData.categoryId ? [{ id: parseInt(productData.categoryId) }] : [],
      images: productData.imageUrl ? [{ src: productData.imageUrl }] : [],
      meta_data: [
        {
          key: '_cost_price',
          value: productData.costPrice?.toString()
        }
      ]
    };

    const response = await api.post("products", wooProduct);
    return convertWooProduct(response.data);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (productId: string, productData: Partial<Product>) => {
  try {
    const wooProduct = {
      name: productData.name,
      regular_price: productData.price?.toString(),
      description: productData.description,
      sku: productData.barcode,
      manage_stock: true,
      stock_quantity: productData.stockQuantity,
      categories: productData.categoryId ? [{ id: parseInt(productData.categoryId) }] : [],
      images: productData.imageUrl ? [{ src: productData.imageUrl }] : [],
      meta_data: [
        {
          key: '_cost_price',
          value: productData.costPrice?.toString()
        }
      ]
    };

    const response = await api.put(`products/${productId}`, wooProduct);
    return convertWooProduct(response.data);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Categories
export const getCategories = async (): Promise<Partial<Category>[]> => {
  try {
    const response = await api.get("products/categories");
    return response.data.map(convertWooCategory);
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const createCategory = async (categoryData: Partial<Category>) => {
  try {
    const response = await api.post("products/categories", {
      name: categoryData.name,
      description: categoryData.description
    });
    return convertWooCategory(response.data);
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Orders
export const createOrder = async (transaction: Transaction) => {
  try {
    const orderData = {
      status: "completed",
      payment_method: transaction.paymentMethod,
      payment_method_title: transaction.paymentMethod === 'cash' ? 'نقدي' : 
                          transaction.paymentMethod === 'card' ? 'بطاقة' : 'محفظة إلكترونية',
      line_items: transaction.items.map(item => ({
        product_id: parseInt(item.productId),
        quantity: item.quantity
      })),
      customer_id: transaction.customerName ? 0 : null, // Guest customer
      meta_data: [
        {
          key: 'pos_receipt_number',
          value: transaction.receiptNumber
        }
      ]
    };

    const response = await api.post("orders", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Stock management
export const updateStock = async (productId: string, quantity: number) => {
  try {
    const response = await api.put(`products/${productId}`, {
      stock_quantity: quantity
    });
    return convertWooProduct(response.data);
  } catch (error) {
    console.error("Error updating stock:", error);
    throw error;
  }
};