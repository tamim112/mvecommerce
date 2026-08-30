import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phone_number: '', role: 'customer' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone_number: formData.phone_number,
      is_customer: formData.role === 'customer',
      is_vendor: formData.role === 'vendor'
    };

    try {
      await apiClient.post('accounts/register/', payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000); // ২ সেকেন্ড পর লগইন পেজে নিয়ে যাবে
    } catch (err) {
      setError(err.response?.data?.username?.[0] || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="flex items-center justify-center pt-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-black text-center text-gray-800 mb-2">নতুন অ্যাকাউন্ট</h2>
        <p className="text-sm text-gray-500 text-center mb-6">আজই আমাদের সাথে যুক্ত হোন</p>
        
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl mb-4 text-center font-medium">নিবন্ধন সফল হয়েছে! লগইন পেজে নিয়ে যাওয়া হচ্ছে...</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* রোল সিলেকশন */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button 
              type="button" onClick={() => setFormData({...formData, role: 'customer'})}
              className={`py-2.5 text-xs font-bold rounded-xl border transition ${formData.role === 'customer' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
            >
              আমি কাস্টমার
            </button>
            <button 
              type="button" onClick={() => setFormData({...formData, role: 'vendor'})}
              className={`py-2.5 text-xs font-bold rounded-xl border transition ${formData.role === 'vendor' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
            >
              আমি বিক্রেতা (Vendor)
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">ইউজারনেম</label>
            <input type="text" required onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm focus:outline-none focus:border-indigo-500" placeholder="username" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">ইমেইল</label>
            <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm focus:outline-none focus:border-indigo-500" placeholder="example@mail.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">ফোন নম্বর</label>
            <input type="text" required onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm focus:outline-none focus:border-indigo-500" placeholder="017XXXXXXXX" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">পাসওয়ার্ড</label>
            <input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm focus:outline-none focus:border-indigo-500" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition text-sm">
            সাইন-আপ করুন
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          ইতিমধ্যে অ্যাকাউন্ট আছে? <Link to="/login" className="text-indigo-600 font-bold hover:underline">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
