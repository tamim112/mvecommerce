import { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { MapPin, Phone, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, fetchCart } = useContext(CartContext);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const grandTotal = cartItems.reduce((total, item) => total + parseFloat(item.total_price), 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress || !phoneNumber) {
      setError('দয়া করে ফোন নম্বর এবং ডেলিভারি ঠিকানা সঠিকভাবে দিন!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Django-র চেকআউট এপিআই এন্ডপয়েন্টে ডেটা পাঠানো
      const response = await apiClient.post('/orders/checkout/', {
        shipping_address: shippingAddress,
        phone_number: phoneNumber
      });

      if (response.status === 201) {
        await fetchCart(); // অর্ডার হওয়ার পর গ্লোবাল কার্ট স্টেট খালি করার জন্য রি-ফেচ
        navigate('/order-success'); // অর্ডার সাকসেস পেজে রিডাইরেক্ট
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border shadow-sm max-w-md mx-auto">
        <p className="text-gray-500 font-medium mb-4">আপনার কার্টে কোনো প্রোডাক্ট নেই!</p>
        <Link to="/" className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md">হোম পেজে যান</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto lg:max-w-4xl space-y-6">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-indigo-600 transition">
        <ArrowLeft className="w-4 h-4" /> কার্ট পেজে ফিরে যান
      </Link>

      <h2 className="text-2xl font-black text-gray-800">অর্ডার কনফার্মেশন</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* শিপিং ইনফরমেশন ফর্ম */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 border-b pb-2">
            <MapPin className="w-5 h-5 text-indigo-600" /> ডেলিভারি তথ্য
          </h3>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center font-medium border border-red-100">{error}</div>}

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> আপনার ফোন নম্বর
              </label>
              <input 
                type="text" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm transition"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> সম্পূর্ণ ডেলিভারি ঠিকানা (Address)
              </label>
              <textarea 
                rows="3" required value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm transition"
                placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, জেলা..."
              ></textarea>
            </div>

            {/* পেমেন্ট মেথড (আপাতত ক্যাশ অন ডেলিভারি) */}
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
              <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                <CreditCard className="w-4 h-4 text-indigo-600" /> পেমেন্ট পদ্ধতি
              </h4>
              <p className="text-xs text-indigo-700/80">বর্তমানে শুধুমাত্র **ক্যাশ অন ডেলিভারি (Cash on Delivery)** সচল আছে। প্রোডাক্ট হাতে পেয়ে টাকা পরিশোধ করুন।</p>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-orange-500 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition text-base flex items-center justify-center gap-2"
            >
              {loading ? "অর্ডার প্রসেস হচ্ছে..." : `৳${grandTotal} মূল্যের অর্ডার কনফার্ম করুন`}
            </button>
          </form>
        </div>

        {/* অর্ডার আইটেম প্রিভিউ কার্ড */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md h-fit space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">আপনার আইটেম সমূহ ({cartItems.length})</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm gap-2">
                <span className="text-gray-700 line-clamp-1 flex-grow">{item.product_details.name} <b className="text-xs text-indigo-600">x{item.quantity}</b></span>
                <span className="font-bold text-gray-900">৳{item.total_price}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between text-base font-black text-gray-900">
            <span>সর্বমোট বিল:</span>
            <span className="text-indigo-600">৳{grandTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
