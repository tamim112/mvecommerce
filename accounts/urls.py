from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
# 🔥 ফিক্স: সব ভিউ ক্লাস views.py থেকে পরিচ্ছন্নভাবে ইম্পোর্ট করা হলো
from .views import (
    RegisterView, 
    CustomTokenObtainPairView, 
    GoogleLoginView, 
    RequestVendorView,
    UpdateProfileView,
)

urlpatterns = [
    # 📝 ১. সাধারণ ইমেইল/ইউজারনেম দিয়ে রেজিস্ট্রেশন এন্ডপয়েন্ট
    path('register/', RegisterView.as_view(), name='auth_register'),
    
    # 🔑 ২. ইউনিভার্সাল লগইন এন্ডপয়েন্ট (কাস্টম মাল্টি-রোল পে-লোড সিরিয়ালাইজার সহ)
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 🔄 ৩. জেডব্লিউটি টোকেন রিফ্রেশ এন্ডপয়েন্ট
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 👤 ৪. ইউজার/প্রোফাইল আপডেট এন্ডপয়েন্ট
    path('update-profile/', UpdateProfileView.as_view(), name='update_profile'),
    
    # 🌐 ৫. ওয়ান-ক্লিক গুগল জিমেইল লগইন এবং অটো-রেজিস্ট্রেশন এপিআই
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    
    # 🏪 ৬. কাস্টমারের ভেন্ডর মার্চেন্ট অ্যাকাউন্ট রিকোয়েস্ট সাবমিশন এন্ডপয়েন্ট
    path('vendor-request/', RequestVendorView.as_view(), name='vendor_request'),
]
