import { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get('/orders/cart/'); // আপনার প্রজেক্টের পাথ অনুযায়ী 'api/' যুক্ত রাখা হলো
      setCartItems(response.data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      alert("কার্টে প্রোডাক্ট যোগ করতে আগে লগইন করুন!");
      return { success: false, loginRequired: true };
    }
    try {
      await apiClient.post('/orders/cart/', { product: productId, quantity });
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error("Add to cart error:", error);
      return { success: false, error: error.response?.data };
    }
  };

  // 🔥 নতুন ফাংশন: কোয়ান্টিটি আপডেট করা
  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await apiClient.patch(`/orders/cart/${cartId}/`, { quantity: newQuantity });
      await fetchCart(); // কার্ট লিস্ট রিলোড করা
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  // 🔥 নতুন ফাংশন: কার্ট থেকে আইটেম মুছে ফেলা
  const removeFromCart = async (cartId) => {
    try {
      await apiClient.delete(`/orders/cart/${cartId}/`);
      await fetchCart();
    } catch (error) {
      console.error("Remove from cart error:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, fetchCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};
