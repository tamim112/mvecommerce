import { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;

  const profile = rawUser.profile || {};

  return {
    ...rawUser,
    id: rawUser.id ?? profile.id ?? null,
    username: rawUser.username ?? profile.username ?? '',
    first_name: rawUser.first_name ?? profile.first_name ?? '',
    last_name: rawUser.last_name ?? profile.last_name ?? '',
    email: rawUser.email ?? profile.email ?? '',
    phone_number: rawUser.phone_number ?? profile.phone_number ?? '',
    address: rawUser.address ?? profile.address ?? '',
    shop_name: rawUser.shop_name ?? profile.shop_name ?? '',
    vendor_status: rawUser.vendor_status ?? profile.vendor_status ?? 'NONE',
    is_customer: rawUser.is_customer ?? profile.is_customer ?? true,
    is_vendor: rawUser.is_vendor ?? profile.is_vendor ?? false,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // অ্যাপ লোড হওয়ার সময় লোকাল স্টোরেজ থেকে ইউজার সেশন রিকভার করা
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const normalizedUser = normalizeUser(parsedUser);
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
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
      
      const normalizedUser = normalizeUser(response.data.user);

      // ব্যাকএন্ড থেকে আসা ইউজারের রিয়েল প্রোফাইল ডেটা সেভ করা
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
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
