import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import apiClient from '../api/apiClient';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  || '319373078569-e4g1lprci9svolk06q017u72lavuvbd9.apps.googleusercontent.com';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  address: '',
  password: '',
  confirmPassword: '',
};

const Register = ({ currentLang = 'bn' }) => {
  const isBn = currentLang === 'bn';
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildUsername = (firstName, lastName, email) => {
    const base = `${firstName} ${lastName}`.trim() || email.split('@')[0];
    const clean = base.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._@+-]/g, '_').replace(/^[_ .]+|[_ .]+$/g, '').slice(0, 30) || 'user';
    return clean.toLowerCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(isBn ? 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।' : 'Password and confirm password do not match.');
      return;
    }

    const username = buildUsername(formData.firstName, formData.lastName, formData.email);

    const payload = {
      username,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone_number: formData.mobile,
      ...(formData.address ? { address: formData.address } : {}),
    };

    try {
      await apiClient.post('accounts/register/', payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      const usernameError = err.response?.data?.username?.[0];
      const emailError = err.response?.data?.email?.[0];
      const phoneError = err.response?.data?.phone_number?.[0];
      setError(usernameError || emailError || phoneError || (isBn ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Registration failed. Please try again.'));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const res = await apiClient.post('accounts/google-login/', {
        credential: credentialResponse.credential,
      });

      if (res.data.access) {
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Google Sign Up Error:', err);
      setError(isBn ? 'গুগল সাইন আপ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Google sign up failed. Please try again.');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex items-center justify-center pt-8 select-none">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg border border-gray-100 animate-fadeIn">
          <h2 className="text-3xl font-black text-center text-gray-800 mb-2">{isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create account'}</h2>
          <p className="text-sm text-gray-500 text-center mb-6">{isBn ? 'আপনার স্টোরে যোগ দিতে সাইন আপ করুন' : 'Sign up to continue with your store'}</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl mb-4 text-center font-medium border border-green-100">
              Registration successful! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">{isBn ? 'প্রথম নাম' : 'First name'}</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm text-gray-700"
                  placeholder={isBn ? 'জহির' : 'John'}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">{isBn ? 'শেষ নাম' : 'Last name'}</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm text-gray-700"
                  placeholder={isBn ? 'খান' : 'Doe'}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">{isBn ? 'ইমেইল' : 'Email'}</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm text-gray-700"
                placeholder={isBn ? 'example@gmail.com' : 'example@gmail.com'}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">{isBn ? 'মোবাইল' : 'Mobile'}</label>
              <input
                type="tel"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm text-gray-700"
                placeholder={isBn ? '০১৭XXXXXXXX' : '017XXXXXXXX'}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">{isBn ? 'ঠিকানা' : 'Address'}</label>
              <textarea
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm text-gray-700 resize-none"
                placeholder={isBn ? 'আপনার ঠিকানা লিখুন' : 'Your address'}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">{isBn ? 'পাসওয়ার্ড' : 'Password'}</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm text-gray-700"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">{isBn ? 'কনফার্ম পাসওয়ার্ড' : 'Confirm password'}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm text-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl shadow-md hover:bg-indigo-700 transition text-sm uppercase tracking-wider"
            >
              {isBn ? 'সাইন আপ' : 'Sign up'}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-3 text-gray-400 font-bold text-[10px] uppercase">{isBn ? 'অথবা গুগল দিয়ে' : 'or sign up with'}</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign up failed.')}
              shape="pill"
              theme="outline"
              size="large"
              text="signup_with"
              ux_mode="popup"
            />
          </div>

          <p className="text-sm font-medium text-center text-gray-500 mt-6">
            {isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              {isBn ? 'লগইন' : 'Login'}
            </Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
