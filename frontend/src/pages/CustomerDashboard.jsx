import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { User, ClipboardList, MapPin, Phone, Calendar, CheckCircle, Clock, FileText, ChevronRight, ShoppingBag } from 'lucide-react';

const CustomerDashboard = ({ currentLang }) => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🎯 অ্যাক্টিভ বা সিলেক্টেড অর্ডার ট্র্যাক করার স্টেট (যা ডানপাশে ডিটেইলস ভিউ দেখাবে)
  const [selectedOrder, setSelectedOrder] = useState(null);

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
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-3xs space-y-2.5">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-2.5">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs uppercase">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <h3 className="font-black text-gray-800 text-xs sm:text-sm truncate">@{user?.username}</h3>
                <p className="text-[9.5px] text-gray-400 font-bold truncate">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{user?.phone_number || (currentLang === 'en' ? 'No phone' : 'ফোন নম্বর নেই')}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-tight">{user?.shipping_address || (currentLang === 'en' ? 'No address' : 'ঠিকানা নেই')}</span>
              </div>
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

      </div>
  );
};

export default CustomerDashboard;
