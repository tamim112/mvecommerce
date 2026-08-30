import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext'; // 🔥 লগইন স্টেট চেক করার জন্য যুক্ত হলো
import { ShoppingCart, Trash2, ArrowRight, Plus, Minus, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, loading } = useContext(CartContext);
  const { user } = useContext(AuthContext); // 🔥 কারেন্ট লগইন ইউজার সেশন রিসিভ করা
  const navigate = useNavigate();

  // সর্বমোট মূল্য হিসাব করা
  const grandTotal = cartItems.reduce((total, item) => total + parseFloat(item.total_price), 0);

  // 🔒 চেকআউট সিকিউরিটি চেক হ্যান্ডলার
  const handleCheckoutVerification = () => {
    if (!user) {
      // ইউজার লগইন না থাকলে মেসেজ দিয়ে সরাসরি লগইন পেজে রিডাইরেক্ট করবে
      alert("অর্ডার কনফার্ম করতে দয়া করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন!");
      navigate('/login');
    } else {
      // লগইন থাকলে সাকসেসফুলি চেকআউট ফর্মে নিয়ে যাবে
      navigate('/checkout');
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
    <div className="space-y-4 max-w-md mx-auto md:max-w-6xl">
      <h2 className="text-lg font-black text-gray-800 flex items-center gap-1.5">
        <ShoppingCart className="w-5 h-5 text-indigo-600" /> শপিং কার্ট ({cartItems.length})
      </h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-400 font-medium mb-3">আপনার কার্টটি বর্তমানে খালি আছে।</p>
          <Link to="/" className="inline-flex items-center gap-1 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs hover:bg-indigo-700 transition">
            প্রোডাক্ট কিনুন <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* কার্ট আইটেম লিস্ট */}
          <div className="md:col-span-2 space-y-2">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-3xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border flex items-center justify-center p-0.5">
                    <img 
                      src={item.product_details.image ? `${item.product_details.image}` : 'https://placeholder.com'} 
                      alt="" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 text-xs sm:text-sm line-clamp-1">{item.product_details.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold">৳{item.product_details.price} / {item.product_details.unit || '1 kg'}</p>
                    
                    {/* কোয়ান্টিটি চেঞ্জার বাটন সমূহ */}
                    <div className="flex items-center gap-2 mt-1.5 bg-gray-50 border border-gray-100 w-fit rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded text-gray-500 transition"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-black px-1.5 text-gray-800">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded text-gray-500 transition"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* প্রাইস এবং রিমুভ বাটন */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-black text-gray-800">৳{parseInt(item.total_price)}</span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* অর্ডার সামারি কার্ড */}
                    {/* 🧾 ফিক্সড এবং ক্লিন রিসিট (Receipt Layout) অর্ডার সামারি কার্ড */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-3xs h-fit select-none overflow-hidden">
            {/* রিসিট হেডার (জিগ-জ্যাগ বাদ দিয়ে একদম ক্লিন মিনিমাল লুক) */}
            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 text-center">
              <h3 className="font-black text-xs text-gray-700 uppercase tracking-wider">
                শপিং ক্যাশ মেমো / RECEIPT
              </h3>
            </div>

            <div className="p-4 space-y-3.5">
              {/* 📑 ১. আইটেম ওয়াইজ রিসিট ব্রেকডাউন (সম্পূর্ণ নাম এবং লাইন ব্রেক সাপোর্ট সহ) */}
              <div className="space-y-2.5 border-b border-dashed border-gray-200 pb-3 max-h-48 overflow-y-auto pr-0.5 scrollbar-none">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  পণ্য তালিকা / Itemized Bill
                </span>
                
                {cartItems.map((item) => (
                  // flex-col বা block এর বদলে items-start ফ্লেক্স ব্যবহার করে দুই পাশে সমান বিন্যাস
                  <div key={item.id} className="flex justify-between items-start gap-4 text-xs border-b border-gray-50/40 pb-1.5 last:border-b-0 last:pb-0">
                    {/* পণ্যের সম্পূর্ণ নাম দেখতে line-clamp-1 এবং max-w সরিয়ে দেওয়া হয়েছে */}
                    <div className="text-gray-600 font-medium break-words flex-grow">
                      {item.product_details.name}
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                        ৳{parseInt(item.product_details.price)} x {item.quantity}
                      </span>
                    </div>
                    {/* মোট দাম ডানপাশে ফিক্সড থাকবে */}
                    <span className="font-bold text-gray-800 flex-shrink-0 text-right pt-0.5">
                      ৳{parseInt(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* 💵 ২. ফিনান্সিয়াল সামারি সেকশন */}
              <div className="space-y-1.5 text-xs text-gray-500 border-b border-dashed border-gray-200 pb-3">
                <div className="flex justify-between">
                  <span>মোট আইটেম সংখ্যা (Unique Items)</span>
                  <span className="font-bold text-gray-700">{cartItems.length} টি</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ (Delivery Fee)</span>
                  <span className="text-green-600 font-black uppercase text-[10px] bg-green-50 px-1.5 py-0.5 rounded">
                    ফ্রি / FREE
                  </span>
                </div>
              </div>

              {/* 💰 ৩. সর্বমোট বিল */}
              <div className="flex justify-between items-baseline pt-0.5">
                <span className="text-xs font-black text-gray-800 uppercase">সর্বমোট বিল / NET PAYABLE</span>
                <span className="text-base font-black text-indigo-600 tracking-tight">
                  ৳{parseInt(grandTotal)}
                </span>
              </div>
              
              {/* 🔒 ডাইনামিক চেকআউট সিকিউরিটি বাটন */}
              <button 
                onClick={handleCheckoutVerification}
                className={`w-full font-black py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5 ${
                  !user 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {!user && <Lock className="w-3.5 h-3.5" />}
                <span>{user ? 'অর্ডার কনফার্মেশনে যান' : 'লগইন করে চেকআউট করুন'}</span>
                {user && <ArrowRight className="w-3.5 h-3.5" />}
              </button>

              {/* আরও কেনাকাটার বাটন */}
              <Link to="/" className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2 rounded-xl transition text-xs flex items-center justify-center border border-gray-200/70">
                <span>আরও প্রোডাক্ট যোগ করুন</span>
              </Link>
            </div>
          </div>


        </div>
      )}
    </div>
  );
};

export default Cart;
