import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, LogOut, LogIn, Menu, Search, Globe, User, LayoutDashboard, ChevronDown } from 'lucide-react';


const Navbar = ({ toggleSidebar, currentLang, setLocalLang, searchQuery, setSearchQuery }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  // 🔘 ড্রপডাউন ওপেন/ক্লোজ স্টেট
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ড্রপডাউনের বাইরে ক্লিক করলে যেন মেনুটি অটো বন্ধ হয়ে যায় (Outside Click Listener)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ইউজারনেমের প্রথম অক্ষর ক্যাপিটাল লেটারে নেওয়া (যেমন: 'tamim' থেকে 'T')
  const userFirstLetter = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="bg-white shadow-sm border-b h-14 fixed top-0 left-0 right-0 z-50 select-none">
      <div className="w-full max-w-[1440px] mx-auto px-4 h-full flex items-center justify-between gap-2 sm:gap-4">
        
        {/* বাম পাশ: গ্লোবাল মেনু টগল বাটন ও লোগো */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <button 
            onClick={toggleSidebar}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="text-sm sm:text-base font-black text-indigo-600 tracking-tight">
            Bazar<span className="text-orange-500">Hub</span>
          </Link>
        </div>

        {/* 🔍 মাঝখানের গ্লোবাল সার্চ বার */}
        <div className="flex-grow max-w-xs sm:max-w-md relative">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={currentLang === 'en' ? 'Search...' : 'খুঁজুন...'}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 text-[11px] border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* ডান পাশ: ল্যাঙ্গুয়েজ, কার্ট, প্রোফাইল অবজেক্ট */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
          {/* 🌐 ল্যাঙ্গুয়েজ সুইচার বাটন */}
          <button 
            onClick={() => setLocalLang(currentLang === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-0.5 px-1.5 py-1 border border-gray-200 hover:border-indigo-500 rounded-lg text-[9px] font-bold text-gray-600 hover:text-indigo-600 transition bg-gray-50"
          >
            <Globe className="w-3 h-3" />
            <span>{currentLang === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* 🛒 কার্ট ব্যাগ বাটন */}
          <Link to="/cart" className="p-1.5 text-gray-600 hover:text-indigo-600 relative transition">
            <ShoppingBag className="w-4 h-4" />
            {cartItems.length > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* 👤 প্রোফাইল পার্ট (লগইন থাকলে প্রিমিয়াম ড্রপডাউন মেনু দেখাবে) */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* 🔘 মেইন ড্রপডাউন ট্রিগার বাটন (ইমেজ বা নামের প্রথম অক্ষর সহ) */}
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100"
              >
                {/* যদি ইউজারের প্রোফাইল পিকচার ডাটাবেজে থাকে তবে ছবি দেখাবে, অন্যথায় নামের প্রথম লেটার বাবল */}
                {user.profile_picture ? (
                  <img 
                    src={`${user.profile_picture}`} 
                    alt="" 
                    className="w-7 h-7 object-cover rounded-full border border-indigo-100"
                  />
                ) : (
                  <div className="w-7 h-7 bg-indigo-600 text-white font-black text-xs rounded-full flex items-center justify-center shadow-2xs">
                    {userFirstLetter}
                  </div>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 📋 🆕 আল্ট্রা-লাক্সারি ফ্লোটিং ড্রপডাউন কার্ড প্যানেল */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-xl py-1.5 z-50 animate-fadeIn text-xs">
                  
                  {/* ক. ইউজার ডিটেইলস সেকশন (নাম ও ইমেইল) */}
                  <div className="px-3 py-2 border-b border-gray-50 bg-gray-50/50">
                    <p className="font-black text-gray-800 text-xs truncate">@{user.username}</p>
                    <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5">{user.email || 'no-email@bazarhub.com'}</p>
                  </div>

                  {/* খ. ড্যাশবোর্ড ও শর্টকাট লিংক সমূহ */}
                  <div className="p-1 space-y-0.5">
                    <button 
                      onClick={() => { setIsDropdownOpen(false); navigate('/dashboard'); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium text-left"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-gray-400" />
                      <span>{currentLang === 'en' ? 'My Dashboard' : 'আমার ড্যাশবোর্ড'}</span>
                    </button>
                

                    {/* ইউজার যদি বিক্রেতা বা ভেন্ডর হয়, তবে এখানেও ভেন্ডর প্যানেল লিংকটি দেখাবে */}
                    {user.is_vendor && (
                      <button 
                        onClick={() => { setIsDropdownOpen(false); navigate('/vendor-dashboard'); }}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-orange-600 hover:bg-orange-50 transition font-bold text-left"
                      >
                        <User className="w-3.5 h-3.5 text-orange-400" />
                        <span>{currentLang === 'en' ? 'Vendor Panel' : 'ভেন্ডর প্যানেল'}</span>
                      </button>
                    )}
                  </div>

                  {/* গ. লগআউট বাটন অ্যাকশন */}
                  <div className="p-1 border-t border-gray-50">
                    <button 
                      onClick={() => { setIsDropdownOpen(false); logout(); navigate('/login'); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-red-500 hover:bg-red-50 transition font-bold text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>{currentLang === 'en' ? 'Sign Out' : 'লগআউট করুন'}</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            /* লগইন না থাকলে সাধারণ স্লিম বাটন */
            <Link to="/login" className="text-[10px] font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
              <span>{currentLang === 'en' ? 'Login' : 'লগইন'}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
