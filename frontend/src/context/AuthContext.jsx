import { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // অ্যাপ লোড হওয়ার সময় লোকাল স্টোরেজ থেকে ইউজার সেশন রিকভার করা
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_details');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // লগইন ফাংশন (কমপ্লিট ডেটা সিঙ্ক ফিক্স)
  const login = async (username, password) => {
    try {
      const response = await apiClient.post('accounts/login/', { username, password });
      
      // ব্যাকএন্ড থেকে আসা টোকেন সেভ করা
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // ব্যাকএন্ড থেকে আসা ইউজারের রিয়েল প্রোফাইল ডেটা সেভ করা
      const userDetails = { 
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        is_vendor: response.data.is_vendor,
        is_customer: response.data.is_customer
      }; 
      
      setUser(userDetails);
      localStorage.setItem('user_details', JSON.stringify(userDetails));
      
      return { success: true };
    } catch (error) {
      console.error("Login Error:", error.response?.data);
      return { success: false, error: error.response?.data || "Login failed" };
    }
  };


  // লগআউট ফাংশন
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_details');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
