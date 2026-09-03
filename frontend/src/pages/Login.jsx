import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import apiClient from '../api/apiClient';
import { LoaderCircle, LockKeyhole, LogIn, Mail } from 'lucide-react';

const Login = ({ currentLang = 'bn' }) => {
  const isBn = currentLang === 'bn';
  // 📧 ফিক্সড: ইউজারনেম অথবা ইমেইল এবং পাসওয়ার্ড ইনপুট স্টেট
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  // 📝 সাধারণ ফর্ম সাবমিট (ইউজারনেম বা ইমেইল ও পাসওয়ার্ড দিয়ে লগইন লজিক)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ইউজারনেম বা ইমেইল যেকোনোটি পাস করতে পারে
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      window.location.href = '/'; 
    } else {
      setError(isBn ? 'ইউজারনেম/ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে! অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Email or password is incorrect. Please try again.');
    }
  };

  // 🌐 গুগলের ওয়ান-ক্লিক জিমেইল সাকসেস হ্যান্ডেলার
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const res = await apiClient.post('accounts/google-login/', {
        credential: credentialResponse.credential
      });
      
      if (res.data.access) {
        // ১. টোকেনসমূহ লোকালস্টোরেজে সেভ করা
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        
        // ২. ইউজার প্রোফাইল অবজেক্টটি লোকালস্টোরেজে স্ট্রিং আকারে ব্যাকআপ রাখা (যদি আপনার কন্টেক্সট এটি রিড করে)
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // 🔥 ৩. ফিক্সড: গ্লোবাল স্টেট এবং ন্যাভবার রি-রেন্ডার ট্রিগার করে ইনস্ট্যান্ট লগইন স্টেট অ্যাক্টিভেট করার মেগা ট্রিকস
        window.location.href = '/';
      }
    } catch (err) {
      console.error("Google Login Backend Error:", err);
      setError(isBn ? 'গুগল লগইন সফল হলেও সেশন তৈরি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Google login succeeded but the session could not be created. Please try again.');
    }
  };

  return (
    // 💡 টিপস: এখানে আপনার নিজের Google Client ID বসিয়ে নেবেন
    <GoogleOAuthProvider clientId="319373078569-e4g1lprci9svolk06q017u72lavuvbd9.apps.googleusercontent.com">

      <div className="flex items-center justify-center pt-8 select-none">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 animate-fadeIn">
          <h2 className="text-2xl font-black text-center text-gray-800 mb-1">{isBn ? 'স্বাগতম ব্যাক!' : 'Welcome back!'}</h2>
          <p className="text-xs text-gray-400 text-center mb-6 font-medium">{isBn ? 'আপনার মার্চেন্ট বা কাস্টমার অ্যাকাউন্ট লগইন করুন' : 'Log in to your merchant or customer account'}</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 text-center font-bold border border-red-100">
              {error}
            </div>
          )}

          {/* ইমেইল ও পাসওয়ার্ড ইনপুট ফর্ম */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                <Mail className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                {isBn ? 'ইমেইল' : 'Email'}
              </label>
              <input 
                type="text" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-xs font-semibold text-gray-700 transition"
                placeholder={isBn ? 'যেমন: demo@gmail.com' : 'e.g. demo@gmail.com'}
              />
            </div>
            
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                <LockKeyhole className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                {isBn ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-xs font-semibold text-gray-700 transition"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black py-2.5 rounded-xl shadow-md hover:bg-indigo-700 transition text-xs uppercase tracking-wider disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogIn className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{loading ? (isBn ? 'প্রসেস হচ্ছে...' : 'Processing...') : (isBn ? 'লগইন করুন' : 'Log in')}</span>
            </button>
          </form>

          {/* 🔘 ওয়ান-ক্লিক জিমেইল লগইন ডিভাইডার রিবন */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-3 text-gray-400 font-bold text-[10px] uppercase">{isBn ? 'অথবা গুগল দিয়ে' : 'or continue with'}</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* গুগলের অফিশিয়াল ওয়ান-ক্লিক বাটন কম্পোনেন্ট */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('গুগল সাইন-ইন প্রসেস ক্র্যাশ করেছে!')}
              shape="pill"
              theme="outline"
              size="large"
              text="signin_with"
              ux_mode="popup"  // পপ-আপ মোড নির্দিষ্ট করা
            />
          </div>

          <p className="text-xs font-bold text-center text-gray-400 mt-6">
            {isBn ? 'প্লাটফর্মে নতুন?' : 'New here?'}{' '}
            <Link to="/register" className="text-indigo-600 font-black hover:underline">
              {isBn ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create an account'}
            </Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
