import requests
from django.contrib.auth import get_user_model
from rest_framework import generics, views, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

# সিরিয়ালাইজার ও মডেল ইম্পোর্ট
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer, UpdateUserProfileSerializer
from .models import UserProfile

import uuid  # 🔥 নতুন ইম্পোর্ট: ইউজারনেম ইউনিক ও সেফ রাখার জন্য


User = get_user_model()

# ডাইনামিক ইউজার মডেল রেফারেন্স রিভ
User = get_user_model()

# ==================== 🔑 ১. সাধারণ ইমেইল ও পাসওয়ার্ড কাস্টম লগইন ভিউ ====================
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    মাল্টি-রোল পে-লোড সমৃদ্ধ কাস্টম জেডব্লিউটি টোকেন জেনারেটর ভিউ
    """
    serializer_class = CustomTokenObtainPairSerializer


# ==================== 📝 ২. সাধারণ ইমেইল ও পাসওয়ার্ড রেজিস্ট্রেশন ভিউ ====================
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "user": UserSerializer(user).data,
            "message": "User registered successfully!",
        }, status=status.HTTP_201_CREATED)


class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = UpdateUserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        instance.refresh_from_db()
        profile, _ = UserProfile.objects.get_or_create(user=instance)

        user_payload = UserSerializer(instance).data
        user_payload.update({
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'email': instance.email,
            'phone_number': profile.phone_number or '',
            'address': profile.address or '',
            'shop_name': profile.shop_name or '',
            'vendor_status': profile.vendor_status,
            'is_customer': profile.is_customer,
            'is_vendor': profile.is_vendor,
        })

        return Response({
            'message': 'Profile updated successfully.',
            'user': user_payload,
        }, status=status.HTTP_200_OK)


# ==================== 🌐 ৩. ওয়ান-ক্লিক গুগল জিমেইল লগইন এবং অটো-রেজিস্ট্রেশন এপিআই ====================
import uuid
import base64
import json
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string  # 🔥 ফিক্স: স্ট্যান্ডার্ড র্যান্ডম পাসওয়ার্ড জেনারেটর
from rest_framework import views, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile

User = get_user_model()

class GoogleLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('credential')
        if not token:
            return Response({"error": "Google token is missing!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 🚀 নেটওয়ার্ক কল ছাড়া জাদুকরী ট্রিকস: গুগলের সিকিউর টোকেন সরাসরি পাইথনেই ডিকোড করা
            token_parts = token.split('.')
            if len(token_parts) != 3:
                return Response({"error": "Invalid token format received from Google"}, status=status.HTTP_400_BAD_REQUEST)
            
            # বেস৬৪ প্যাডিং ফিক্সসহ পে-লোড ডিকোড করা
            payload_b64 = token_parts[1]
            payload_b64 += '=' * (-len(payload_b64) % 4)
            payload_json = base64.b64decode(payload_b64).decode('utf-8')
            idinfo = json.loads(payload_json)

            # সেফটি চেক
            if "email" not in idinfo:
                return Response({"error": "Email info could not be recovered from Google Token"}, status=status.HTTP_400_BAD_REQUEST)
            
            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            # ১. ইমেইল ফিল্টার করে অলরেডি অ্যাকাউন্ট আছে কি না চেক করা
            user = User.objects.filter(email=email).first()
            
            # ২. ইউজার না থাকলে ফ্রেশ অটো-রেজিস্ট্রেশন করা
            if not user:
                # 🔥 ফিক্সড: জিমেইলের প্রথম অংশ স্ট্রিং হিসেবে নিয়ে ডট (.) কে আন্ডারস্কোর করা হলো
                email_username_part = email.split('@')[0]
                base_username = email_username_part.replace('.', '_')
                username = base_username
                
                # ইউজারনেম ডুপ্লিকেট এড়ানোর লুপ
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{uuid.uuid4().hex[:4]}"
                
                # 🔥 ফিক্সড: জ্যাঙ্গোর কাস্টম ম্যানেজার এরর এড়াতে বিল্ট-ইন জেনারেটর দিয়ে সুরক্ষিত পাসওয়ার্ড তৈরি
                random_password = get_random_string(length=16)
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=random_password
                )

            # ৩. সাকসেসফুল JWT টোকেন জেনারেট করা
            refresh = RefreshToken.for_user(user)
            
            # ৪. ওয়ান-টু-ওয়ান রিলেশন প্রোфাইল নিশ্চিত করা
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_customer": profile.is_customer,
                    "is_vendor": profile.is_vendor,
                    "vendor_status": profile.vendor_status,
                    "phone_number": profile.phone_number if profile.phone_number else "",
                    "address": profile.address if profile.address else "",
                    "shop_name": profile.shop_name if profile.shop_name else ""
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("🔥 GOOGLE LOGIN CRITICAL EXCEPTION:", str(e))
            return Response({"error": f"Failed to decrypt Google Token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)



# ==================== 🏪 ৪. কাস্টমারের ভেন্ডর মার্চেন্ট অ্যাকাউন্ট রিকোয়েস্ট সাবমিশন এন্ডপয়েন্ট ====================
class RequestVendorView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # সেফটি মেকানিজম: প্রোফাইল না থাকলে ক্র্যাশ এড়াতে গেট_অর_ক্রিয়েট করা
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        if profile.is_vendor or profile.vendor_status == 'PENDING':
            return Response({"error": "Already a vendor or request is pending!"}, status=status.HTTP_400_BAD_REQUEST)
        
        shop_name = request.data.get('shop_name')
        phone_number = request.data.get('phone_number')
        
        if not shop_name:
            return Response({"error": "Shop name is required!"}, status=status.HTTP_400_BAD_REQUEST)
        
        profile.shop_name = shop_name
        profile.phone_number = phone_number if phone_number else profile.phone_number
        profile.vendor_status = 'PENDING'
        profile.save()
        
        return Response({"message": "Vendor request submitted successfully!"}, status=status.HTTP_200_OK)
