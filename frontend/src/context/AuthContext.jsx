import { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // অ্যাপ লোড হওয়ার সময় লোকাল স্টোরেজ থেকে ইউজার সেশন রিকভার করা
// 🎯 আপনার AuthContext এর ভেতরে useEffect বা ইনিশিয়াল স্টেটটি এমন হওয়া উচিত:
useEffect(() => {
  const token = localStorage.getItem('access_token');
  const savedUser = localStorage.getItem('user');

  if (token && savedUser) {
    try {
      // লোকালস্টোরেজে থাকা স্ট্রিংটিকে আবার অবজেক্ট বানিয়ে গ্লোবাল স্টেটে সেট করা
      setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
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
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
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
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
