import { useState, useEffect, useContext } from 'react'; // useEffect এবং useContext যুক্ত করা হলো
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; // AuthContext নিয়ে আসা হলো
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import VendorDashboard from './pages/VendorDashboard';
import CustomerDashboard from './pages/CustomerDashboard'; // 🔥 নতুন ইম্পোর্ট

// 🔒 ১. নতুন প্রফেশনাল প্রটেক্টেড রাউট (লগইন ছাড়া চেকআউট আটকাতে)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // কাস্টমার লগইন না থাকলে তাকে চেকআউট করতে না দিয়ে সরাসরি লগইন স্ক্রিনে রিডাইরেক্ট করবে
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lang, setLang] = useState('bn');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // 📱 ২. স্ক্রিন সাইজ চেক করে মোবাইলে ডিফল্টভাবে সাইডবার ক্লোজ রাখার অটো-লজিক
  useEffect(() => {
    const handleScreenSetup = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false); // মোবাইলে অ্যাপ লোড হলে সাইডবার বন্ধ থাকবে
      } else {
        setIsSidebarOpen(true);  // ডেক্সটপ বা ল্যাপটপে লোড হলে খোলা থাকবে
      }
    };

    handleScreenSetup(); // রান অন লোড

    window.addEventListener('resize', handleScreenSetup);
    return () => window.removeEventListener('resize', handleScreenSetup);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans antialiased text-sm">
            
            {/* ১. ফিক্সড ন্যাভবার */}
            <Navbar 
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
              isSidebarOpen={isSidebarOpen} 
              currentLang={lang} 
              setLocalLang={setLang}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            
            <div className="flex flex-grow w-full mx-auto pt-14 relative">
              
              {/* 📱 ২. রেসপন্সিভ সাইডবার: ডেক্সটপে ফিক্সড কোলাপ্সিবল এবং মোবাইলেও স্লাইড-ইন ওভারলে ড্রয়ার মেনু */}
              <aside 
                className={`fixed md:sticky top-14 h-[calc(100vh-3.5rem)] border-r border-gray-200 bg-white overflow-y-auto transition-all duration-300 z-50 shadow-md md:shadow-none ${
                  isSidebarOpen 
                    ? 'w-56 translate-x-0 opacity-100' 
                    : '-translate-x-full md:translate-x-0 md:w-0 opacity-0 md:hidden'
                }`}
              >
                <Sidebar 
                  onSelectCategory={(id) => { setSelectedCategory(id); setSelectedSubCategory(null); }} 
                  onSelectSubCategory={setSelectedSubCategory} 
                  selectedCategory={selectedCategory}
                  selectedSubCategory={selectedSubCategory}
                  currentLang={lang}
                  closeMobileSidebar={() => setIsSidebarOpen(false)} // মোবাইলে ক্যাটাগরি ক্লিক করলে যেন সাইডবার অটো বন্ধ হয়
                />
              </aside>

              {/* 🌫️ মোবাইলের জন্য ব্যাকগ্রাউন্ড ডার্ক ব্লার শ্যাডো (যখন সাইডবার ওপেন থাকবে) */}
              {isSidebarOpen && (
                <div 
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden fixed inset-0 top-14 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
                />
              )}

              {/* ৩. মেইন কন্টেন্ট এরিয়া (সাইডবার অন/অফ যাই হোক পণ্য তালিকা পারфেক্ট থাকবে) */}
              <main className="flex-grow p-3 overflow-x-hidden min-h-[calc(100vh-3.5rem)] w-full">
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <Home 
                        selectedCategory={selectedCategory} 
                        selectedSubCategory={selectedSubCategory}
                        setSelectedCategory={setSelectedCategory}
                        setSelectedSubCategory={setSelectedSubCategory}
                        currentLang={lang}
                        searchQuery={searchQuery}
                      />
                    } 
                  /> 
                  <Route path="/login" element={<Login currentLang={lang} />} />
                  <Route path="/register" element={<Register currentLang={lang} />} />
                  <Route path="/cart" element={<Cart />} />
                  
                  {/* 🔒 চেকআউট রাউটটিকে প্রটেক্টেড রাউট দিয়ে ঘিরে দেওয়া হলো */}
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                  <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard currentLang={lang} /></ProtectedRoute>} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
