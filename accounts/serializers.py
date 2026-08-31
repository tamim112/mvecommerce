from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# 🔥 ফিক্স: আপনার অ্যাকাউন্টস অ্যাপের প্রোফাইল মডেলটি ইম্পোর্ট করা হলো
from .models import UserProfile  
User = get_user_model()

# ==================== 📝 ১. রেজিস্টার সিরিয়ালাইজার (উইথ প্রোফাইল ডাটা সিঙ্ক) ====================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    # প্রোফাইলের এক্সট্রা ফিল্ডগুলো সিরিয়ালাইজারে ডিক্লেয়ার করা হলো
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        # ফিক্সড: জ্যাঙ্গোর ডিফল্ট ইউজার ফিল্ডস (ইমেইল দিয়ে লগইন হবে তাই ইমেইল রিকোয়ার্ড)
        fields = ['username', 'email', 'password', 'phone_number']

    def create(self, validated_data):
        # প্রোফাইলের ডেটা আলাদা করে নেওয়া
        phone_number = validated_data.pop('phone_number', '')
        
        # ১. ডিফল্ট জ্যাঙ্গো ইউজার তৈরি
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # ২. আমাদের ওয়ান-টু-ওয়ান প্রোফাইল টেবিলে ডেটা সিঙ্ক করা
        # সিগন্যাল দিয়ে প্রোফাইল অটো তৈরি হলেও সেফটির জন্য আমরা গেট_অর_ক্রিয়েট দিয়ে আপডেট করছি
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.phone_number = phone_number
        profile.is_customer = True  # সবাই শুরুতে ডিফল্ট কাস্টমার
        profile.is_vendor = False   # শুরুতে সরাসরি কেউ ভেন্ডর হতে পারবে না
        profile.vendor_status = 'NONE'
        profile.save()
        
        return user


# ==================== 👤 ২. ইউজার ডাটা রিট্রিভ সিরিয়ালাইজার ====================
class UserSerializer(serializers.ModelSerializer):
    is_customer = serializers.BooleanField(source='profile.is_customer', read_only=True)
    is_vendor = serializers.BooleanField(source='profile.is_vendor', read_only=True)
    vendor_status = serializers.CharField(source='profile.vendor_status', read_only=True)
    phone_number = serializers.CharField(source='profile.phone_number', read_only=True)
    shop_name = serializers.CharField(source='profile.shop_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_customer', 'is_vendor', 'vendor_status', 'phone_number', 'shop_name']


# ==================== 🔑 ৩. কাস্টম জেডব্লিউটি লগইন সিরিয়ালাইজার ====================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # 🔥 ইমেইল বা ইউজারনেম উভয়েই লগইন করতে পারবে
    username_field = 'username'
    
    def validate(self, attrs):
        # ফ্রন্টএন্ড থেকে আসা 'username' হতে পারে ইমেইল বা প্রকৃত ইউজারনেম
        username_or_email = attrs.get('username')
        
        # যদি '@' থাকে তাহলে এটি ইমেইল, তাহলে ইউজারনেম খুঁজে বের করো
        if '@' in str(username_or_email):
            try:
                user = User.objects.get(email=username_or_email)
                attrs['username'] = user.username  # ইউজারনেম দিয়ে রিপ্লেস করো
            except User.DoesNotExist:
                pass
        
        # ডিফল্ট JWT টোকেন পে-লোড (access & refresh token) জেনারেট করা
        data = super().validate(attrs)
        
        # ওয়ান-টু-ওয়ান প্রোফাইল অবজেক্টটি তুলে আনা
        profile, created = UserProfile.objects.get_or_create(user=self.user)
                
        # ফ্রন্টএন্ড গ্লোবাল স্টেটের জন্য লাইভ ডাটা স্ট্রাকচার
        data['user'] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "is_staff": self.user.is_staff,
            "is_customer": profile.is_customer,
            "is_vendor": profile.is_vendor,
            "vendor_status": profile.vendor_status,
            "shop_name": profile.shop_name if profile.shop_name else ""
        }
        return data
