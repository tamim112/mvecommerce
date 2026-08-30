import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (result.success) {
      // উইন্ডো রিলোডসহ হোম পেজে পাঠানো যাতে গ্লোবাল স্টেট এবং ন্যাভবার রি-রেন্ডার হয়
      window.location.href = '/'; 
    } else {
      setError('ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে!');
    }
  };
  return (
    <div className="flex items-center justify-center pt-10">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-black text-center text-gray-800 mb-2">স্বাগতম ব্যাক!</h2>
        <p className="text-sm text-gray-500 text-center mb-6">আপনার অ্যাকাউন্ট লগইন করুন</p>
        
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">ইউজারনেম</label>
            <input 
              type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm transition"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">পাসওয়ার্ড</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm transition"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition text-sm">
            লগইন করুন
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          অ্যাকাউন্ট নেই? <Link to="/register" className="text-indigo-600 font-bold hover:underline">নতুন অ্যাকাউন্ট তৈরি করুন</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
