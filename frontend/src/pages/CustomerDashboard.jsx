import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { User, ClipboardList, MapPin, Phone, Calendar, CheckCircle, Clock, FileText, ChevronRight, ShoppingBag, Store, Pencil, Save, X } from 'lucide-react';
const CustomerDashboard = ({ currentLang }) => {
  const { user, setUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🎯 অ্যাক্টিভ বা সিলেক্টেড অর্ডার ট্র্যাক করার স্টেট (যা ডানপাশে ডিটেইলস ভিউ দেখাবে)
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // 🔥 প্রোফাইল আপডেট মডাল স্টেট
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // 🔥 ভেন্ডর রিকোয়েস্ট মডাল স্টেট
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [vendorLoading, setVendorLoading] = useState(false);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const token = localStorage.getItem('access_token'); 
        const res = await apiClient.get('orders/customer/orders/', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          }
        });
        const orderData = res.data || [];
        setOrders(orderData);
        
        // ডিফল্টভাবে প্রথম অর্ডারটি ডানপাশে সিলেক্টেড থাকবে (যদি কোনো অর্ডার থাকে)
        if (orderData.length > 0) {
          setSelectedOrder(orderData[0]);
        }
      } catch (err) {
        console.error("Order history fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderHistory();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const openProfileModal = () => {
    if (!user) return;
    setProfileForm({
      first_name: user.first_name || user.profile?.first_name || '',
      last_name: user.last_name || user.profile?.last_name || '',
      email: user.email || user.profile?.email || '',
      phone_number: user.phone_number || user.profile?.phone_number || '',
      address: user.address || user.profile?.address || '',
    });
    setShowProfileModal(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      setProfileLoading(true);
      const res = await apiClient.patch('accounts/update-profile/', profileForm, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowProfileModal(false);
      alert(currentLang === 'en' ? 'Profile updated successfully.' : 'প্রোফাইল আপডেট সফল হয়েছে।');
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.response?.data?.message || 'Profile update failed.';
      alert(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  // 🔥 ভেন্ডর রিকোয়েস্ট হ্যান্ডেল করার ফাংশন
  const handleVendorRequest = async (e) => {
    e.preventDefault();
    if (!shopName) return;

    try {
      setVendorLoading(true);
      const token = localStorage.getItem('access_token');
      
      const res = await apiClient.post('accounts/vendor-request/', 
        { shop_name: shopName, phone_number: phone },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );

      // ফ্রন্টএন্ডের গ্লোবাল ইউজার স্টেট ও লোকালস্টোরেজ ইনস্ট্যান্ট আপডেট
      const updatedUser = {
        ...user,
        vendor_status: 'PENDING',
        shop_name: shopName,
        phone_number: phone || user?.phone_number
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert(res.data.message || "আপনার ভেন্ডর রিকোয়েস্টটি সফলভাবে পাঠানো হয়েছে!");
      setShowVendorModal(false);
      setShopName('');
      setPhone('');
    } catch (err) {
      console.error("Vendor request error:", err.response?.data || err.message);
      
      // ব্যাকএন্ড থেকে এসা সুনির্দিষ্ট এরর মেসেজ বা ডিফল্ট এরর মেসেজ দেখাও
      const errorMsg = err.response?.data?.error 
        || err.response?.data?.message 
        || err.response?.data?.detail
        || "রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে! অনুগ্রহ করে আবার চেষ্টা করুন।";
      alert(errorMsg);
    } finally {
      setVendorLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 select-none">
      <h2 className="text-base font-black text-gray-800 flex items-center gap-1.5">
        <User className="w-5 h-5 text-indigo-600" />
        {currentLang === 'en' ? 'My Account Dashboard' : 'আমার অ্যাকাউন্ট ড্যাশবোর্ড'}
      </h2>

      {/* মেইন গ্রিড লেআউট (ডেক্সটপে ৩ কলামে ভাগ হবে) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        
        {/* ==================== ⬅️ বাম কলাম (প্রোফাইল + ইনভয়েস লিস্ট সাইডবার) ==================== */}
        <div className="md:col-span-1 space-y-3">
          
          {/* ১. কাস্টমার প্রোফাইলカード */}
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-3xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs uppercase">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <h3 className="font-black text-gray-800 text-xs sm:text-sm truncate">
                    {(user?.first_name || user?.profile?.first_name || user?.last_name || user?.profile?.last_name)
                      ? `${user?.first_name || user?.profile?.first_name || ''} ${user?.last_name || user?.profile?.last_name || ''}`.trim()
                      : '@' + (user?.username || user?.profile?.username || '')}
                  </h3>
                  <p className="text-[9.5px] text-gray-400 font-bold truncate">{user?.email || user?.profile?.email}</p>
                </div>
              </div>
              <button
                onClick={openProfileModal}
                className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-black text-indigo-600 border border-indigo-100 hover:bg-indigo-50 rounded-lg transition"
              >
                <Pencil className="w-3 h-3" aria-hidden="true" />
                {currentLang === 'en' ? 'Edit' : 'এডিট'}
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-gray-600">
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <span className="font-bold text-gray-400">{currentLang === 'en' ? 'Name' : 'নাম'}</span>
                <span className="font-semibold text-gray-700">{user?.first_name || user?.profile?.first_name || user?.last_name || user?.profile?.last_name ? `${user?.first_name || user?.profile?.first_name || ''} ${user?.last_name || user?.profile?.last_name || ''}`.trim() : (currentLang === 'en' ? 'Not added' : 'জোড়া হয়নি')}</span>
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <span className="font-bold text-gray-400">Username</span>
                <span className="font-semibold text-gray-700">@{user?.username || user?.profile?.username || (currentLang === 'en' ? 'No username' : 'ইউজার নেই')}</span>
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <span className="font-bold text-gray-400">Email</span>
                <span className="font-semibold text-gray-700 break-all">{user?.email || user?.profile?.email || (currentLang === 'en' ? 'No email' : 'ইমেইল নেই')}</span>
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <span className="font-bold text-gray-400">{currentLang === 'en' ? 'Phone' : 'ফোন'}</span>
                <span className="font-semibold text-gray-700">{user?.phone_number || user?.profile?.phone_number || (currentLang === 'en' ? 'No phone' : 'ফোন নেই')}</span>
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <span className="font-bold text-gray-400">{currentLang === 'en' ? 'Address' : 'ঠিকানা'}</span>
                <span className="font-semibold text-gray-700 leading-tight">{user?.address || user?.profile?.address || (currentLang === 'en' ? 'No address' : 'ঠিকানা নেই')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => setShowVendorModal(true)}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-black border rounded-lg transition ${
                  user?.vendor_status === 'APPROVED'
                    ? 'text-green-600 border-green-100 hover:bg-green-50'
                    : user?.vendor_status === 'PENDING'
                      ? 'text-amber-600 border-amber-100 hover:bg-amber-50'
                      : 'text-indigo-600 border-indigo-100 hover:bg-indigo-50'
                }`}
              >
                {user?.vendor_status === 'APPROVED' ? (
                  <CheckCircle className="w-3 h-3" aria-hidden="true" />
                ) : user?.vendor_status === 'PENDING' ? (
                  <Clock className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <Store className="w-3 h-3" aria-hidden="true" />
                )}
                {user?.vendor_status === 'APPROVED'
                  ? (currentLang === 'en' ? 'Vendor Approved' : 'ভেন্ডর অনুমোদিত')
                  : user?.vendor_status === 'PENDING'
                    ? (currentLang === 'en' ? 'Request Pending' : 'রিকোয়েস্ট পেন্ডিং')
                    : (currentLang === 'en' ? 'Vendor Request' : 'ভেন্ডর রিকোয়েস্ট')}
              </button>
            </div>
          </div>

          {/* ২. 🆕 ইনভয়েস কুইক লিস্ট সাইডবার (Invoice Sidebar List) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
            <div className="bg-gray-50/80 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                {currentLang === 'en' ? 'Invoices' : 'ইনভয়েস তালিকা'}
              </span>
              <span className="bg-indigo-50 text-indigo-600 font-black px-1.5 py-0.2 rounded text-[9px]">
                {orders.length}
              </span>
            </div>

            <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto pr-0.5 scrollbar-none">
              {orders.length === 0 ? (
                <div className="text-center py-6 text-[11px] text-gray-400 font-medium">
                  {currentLang === 'en' ? 'No invoices found' : 'কোনো ইনভয়েস নেই'}
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      selectedOrder?.id === order.id 
                        ? 'bg-indigo-50/50 border-l-4 border-indigo-600 pl-1.5' 
                        : 'hover:bg-gray-50 bg-white border-l-4 border-transparent'
                    }`}
                  >
                    <div className="space-y-0.5 flex-grow truncate">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-gray-800 text-[11px]">#BZH-{order.id}</span>
                        <span className="font-black text-indigo-600 text-[11px]">৳{parseInt(order.total_amount)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[9.5px] text-gray-400 font-bold mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        
                        <span className={`px-1 rounded-sm text-[8.5px] font-black uppercase ${
                          order.status === 'Completed' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ==================== ➡️ ডান কলাম (সিলেক্টেড ইনভয়েস ডিটেইলস ভিউ) ==================== */}
        <div className="md:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden animate-fadeIn">
              
              {/* ক. ডিটেইলস হেডার / রিসিট মেমো ব্যানার */}
              <div className="bg-gray-50/70 p-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="font-black text-gray-800 text-sm flex items-center gap-1">
                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                    {currentLang === 'en' ? `Invoice details #BZH-${selectedOrder.id}` : `ইনভয়েস বিবরণ #BZH-${selectedOrder.id}`}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {currentLang === 'en' ? 'Order Date:' : 'অর্ডারের তারিখ:'} {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>

                {/* বড় স্ট্যাটাস ফ্ল্যাগ */}
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 ${
                    selectedOrder.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {selectedOrder.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {selectedOrder.status}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    selectedOrder.is_paid ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {selectedOrder.is_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>

              {/* খ. ডেলিভারি ইনফো সামারি */}
              <div className="p-3 bg-gray-50/30 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 font-medium">
                <div className="flex gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Contact Phone</span>
                    <span className="text-gray-700 font-bold">{selectedOrder.phone_number}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Shipping Address</span>
                    <span className="text-gray-700 font-bold line-clamp-2 leading-tight">{selectedOrder.shipping_address}</span>
                  </div>
                </div>
              </div>

               {/* গ. প্রধান আইটেম তালিকা (Itemized Bills Table) - ফিক্সড ও রেডি */}
              <div className="p-3 space-y-2.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  পণ্য ব্রেকডাউন / Product Items
                </span>
                
                <div className="divide-y divide-gray-100 border border-gray-50 rounded-xl overflow-hidden bg-white">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center text-xs hover:bg-gray-50/60 transition">
                      <div className="space-y-0.5 pr-4">
                        <span className="font-bold text-gray-700 block leading-tight">{item.product_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          ৳{parseInt(item.price)} x {item.quantity}
                        </span>
                      </div>
                      <span className="font-black text-gray-800 text-right flex-shrink-0">
                        ৳{parseInt(parseFloat(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ঘ. গ্র্যান্ড নেট বিল ফুটার মেমো */}
                <div className="border-t border-dashed border-gray-200 pt-3 mt-4 flex justify-between items-baseline px-1">
                  <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                    মোট পরিশোধিত বিল / TOTAL PAYABLE
                  </span>
                  <span className="text-base sm:text-lg font-black text-indigo-600 tracking-tight">
                    ৳{parseInt(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white py-16 rounded-xl border border-dashed text-center text-xs text-gray-400 font-medium">
              <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              {currentLang === 'en' ? 'Select an invoice from the sidebar to view full details.' : 'পূর্ণাঙ্গ রিসিট দেখতে বামপাশের তালিকা থেকে একটি ইনভয়েস সিলেক্ট করুন।'}
            </div>
          )}
        </div>

      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                {currentLang === 'en' ? 'Edit profile' : 'প্রোফাইল আপডেট'}
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-gray-500 font-black tracking-wider">
                    {currentLang === 'en' ? 'First name' : 'নামের প্রথম অংশ'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-gray-500 font-black tracking-wider">
                    {currentLang === 'en' ? 'Last name' : 'নামের শেষ অংশ'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] uppercase text-gray-500 font-black tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] uppercase text-gray-500 font-black tracking-wider">
                    {currentLang === 'en' ? 'Phone number' : 'মোবাইল নম্বর'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone_number}
                    onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] uppercase text-gray-500 font-black tracking-wider">
                    {currentLang === 'en' ? 'Address' : 'ঠিকানা'}
                  </label>
                  <textarea
                    rows="3"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50 text-xs font-semibold resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 border border-gray-200 text-gray-600 font-black rounded-lg hover:bg-gray-50 transition text-xs uppercase"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  {currentLang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition disabled:bg-gray-300 text-xs uppercase"
                >
                  {!profileLoading && <Save className="w-3.5 h-3.5" aria-hidden="true" />}
                  {profileLoading ? '...' : (currentLang === 'en' ? 'Save' : 'সংরক্ষণ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVendorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full space-y-4 animate-fadeIn">
            
            {/* মডাল হেডার */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600" />
                {currentLang === 'en' ? 'Become a Vendor' : 'ভেন্ডর হিসেবে যোগ দিন'}
              </h3>
              <button 
                onClick={() => {
                  setShowVendorModal(false);
                  setShopName('');
                  setPhone('');
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* মডাল কন্টেন্ট */}
            <div className="px-4 pb-4 space-y-4">
              
              {/* কেস ১: PENDING স্ট্যাটাস */}
              {user?.vendor_status === 'PENDING' ? (
                <div className="bg-amber-50/60 text-amber-800 p-4 rounded-xl border border-amber-100/70 flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5 text-amber-600 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-black text-sm text-amber-900">{currentLang === 'en' ? 'Request Pending' : 'আবেদনটি প্রক্রিয়াধীন'}</p>
                    <p className="text-[11px] font-semibold text-amber-600/90">
                      {currentLang === 'en' 
                        ? `Your shop "${user.shop_name}" request is under review.`
                        : `আপনার দোকান "${user.shop_name}" এর ভেন্ডর রিকোয়েস্টটি অ্যাডমিন প্যানেলে জমা আছে।`
                      }
                    </p>
                  </div>
                </div>
              ) : user?.vendor_status === 'APPROVED' ? (
                <div className="bg-green-50/60 text-green-800 p-4 rounded-xl border border-green-100/70 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-black text-sm text-green-900">{currentLang === 'en' ? 'Vendor Approved!' : 'আপনি এখন ভেন্ডর'}</p>
                    <p className="text-[11px] font-semibold text-green-600/90">
                      {currentLang === 'en'
                        ? `Shop: ${user.shop_name} (Active in Merchant Mode)`
                        : `দোকান: ${user.shop_name} (মার্চেন্ট মোড সক্রিয়)`
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVendorRequest} className="space-y-3">
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {currentLang === 'en'
                      ? 'Fill in your shop details to become a vendor on our platform.'
                      : 'আপনার দোকানের বিবরণ দিয়ে ভেন্ডর হিসেবে আবেদন করুন।'
                    }
                  </p>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-gray-500 font-black tracking-wider">
                      {currentLang === 'en' ? 'Shop Name' : 'দোকানের নাম'} *
                    </label>
                    <input 
                      required
                      type="text" 
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder={currentLang === 'en' ? 'e.g., My Store' : 'যেমন: তমিজ গ্রোসারি মার্ট'}
                      className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-gray-500 font-black tracking-wider">
                      {currentLang === 'en' ? 'Phone Number' : 'মোবাইল নাম্বার'} ({currentLang === 'en' ? 'Optional' : 'ঐচ্ছিক'})
                    </label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50 text-xs font-semibold"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowVendorModal(false);
                        setShopName('');
                        setPhone('');
                      }}
                      className="flex-1 px-3 py-2.5 border border-gray-200 text-gray-600 font-black rounded-lg hover:bg-gray-50 transition text-xs uppercase"
                    >
                      {currentLang === 'en' ? 'Cancel' : 'বাতিল'}
                    </button>
                    <button
                      disabled={vendorLoading}
                      type="submit"
                      className="flex-1 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition disabled:bg-gray-300 text-xs uppercase"
                    >
                      {vendorLoading ? '...' : (currentLang === 'en' ? 'Submit' : 'জমা দিন')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>);
}
export default CustomerDashboard;
