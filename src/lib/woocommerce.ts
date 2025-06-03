import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Initialize the WooCommerce API
const api = new WooCommerceRestApi({
  url: import.meta.env.VITE_WP_URL,
  consumerKey: import.meta.env.VITE_WC_CONSUMER_KEY,
  consumerSecret: import.meta.env.VITE_WC_CONSUMER_SECRET,
  version: "wc/v3"
});

// Products
export const getProducts = async () => {
  try {
    const response = await api.get("products", {
      per_page: 100,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const createProduct = async (productData: any) => {
  try {
    const response = await api.post("products", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (productId: number, productData: any) => {
  try {
    const response = await api.put(`products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Categories
export const getCategories = async () => {
  try {
    const response = await api.get("products/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Orders
export const createOrder = async (orderData: any) => {
  try {
    const response = await api.post("orders", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await api.get("orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Stock management
export const updateStock = async (productId: number, quantity: number) => {
  try {
    const response = await api.put(`products/${productId}`, {
      stock_quantity: quantity
    });
    return response.data;
  } catch (error) {
    console.error("Error updating stock:", error);
    throw error;
  }
};