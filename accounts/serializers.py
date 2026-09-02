import re
import uuid

from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# 🔥 ফিক্স: আপনার অ্যাকাউন্টস অ্যাপের প্রোফাইল মডেলটি ইম্পোর্ট করা হলো
from .models import UserProfile  
User = get_user_model()


def generate_unique_username(first_name='', last_name='', email=''):
    raw_name = ' '.join(part for part in [first_name, last_name] if part).strip()
    base = re.sub(r'[^A-Za-z0-9._@+-]', '_', raw_name).strip('._@+-') if raw_name else ''
    if not base:
        base = (email or 'user').split('@')[0].strip()
    base = re.sub(r'[^A-Za-z0-9._@+-]', '_', base).strip('._@+-') or 'user'
    base = base[:30]

    candidate = base.lower()
    counter = 1
    while User.objects.filter(username=candidate).exists():
        candidate = f"{base.lower()}{counter}"
        counter += 1

    return candidate

# ==================== 📝 ১. রেজিস্টার সিরিয়ালাইজার (উইথ প্রোফাইল ডাটা সিঙ্ক) ====================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'phone_number', 'address']

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        address = validated_data.pop('address', '') or ''
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')

        username = validated_data.get('username')
        if username:
            username = re.sub(r'[^A-Za-z0-9._@+-]', '_', username).strip('._@+-')
        if not username:
            username = generate_unique_username(first_name, last_name, validated_data.get('email', ''))
        else:
            candidate = username.lower()
            counter = 1
            while User.objects.filter(username=candidate).exists():
                candidate = f"{username.lower()}{counter}"
                counter += 1
            username = candidate

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )

        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.phone_number = phone_number
        profile.address = address or None
        profile.is_customer = True
        profile.is_vendor = False
        profile.vendor_status = 'NONE'
        profile.save()

        return user


# ==================== 👤 ২. ইউজার ডাটা রিট্রিভ সিরিয়ালাইজার ====================
class UserSerializer(serializers.ModelSerializer):
    is_customer = serializers.BooleanField(source='profile.is_customer', read_only=True)
    is_vendor = serializers.BooleanField(source='profile.is_vendor', read_only=True)
    vendor_status = serializers.CharField(source='profile.vendor_status', read_only=True)
    phone_number = serializers.CharField(source='profile.phone_number', read_only=True)
    address = serializers.CharField(source='profile.address', read_only=True)
    shop_name = serializers.CharField(source='profile.shop_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_customer', 'is_vendor', 'vendor_status', 'phone_number', 'address', 'shop_name']


class UpdateUserProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'phone_number', 'address']

    def validate_email(self, value):
        if value and User.objects.exclude(pk=self.instance.pk).filter(email=value).exists():
            raise serializers.ValidationError('This email is already in use.')
        return value

    def validate_username(self, value):
        if value and User.objects.exclude(pk=self.instance.pk).filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def update(self, instance, validated_data):
        phone_number = validated_data.pop('phone_number', None)
        address = validated_data.pop('address', None)

        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        profile.phone_number = phone_number if phone_number is not None else profile.phone_number
        profile.address = address if address is not None else profile.address
        profile.save()

        return instance


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
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "email": self.user.email,
            "is_staff": self.user.is_staff,
            "is_customer": profile.is_customer,
            "is_vendor": profile.is_vendor,
            "vendor_status": profile.vendor_status,
            "phone_number": profile.phone_number if profile.phone_number else "",
            "address": profile.address if profile.address else "",
            "shop_name": profile.shop_name if profile.shop_name else ""
        }
        return data
