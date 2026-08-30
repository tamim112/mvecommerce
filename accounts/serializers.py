from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import VendorProfile

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'is_customer', 'is_vendor', 'phone_number']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            is_customer=validated_data.get('is_customer', False),
            is_vendor=validated_data.get('is_vendor', False),
            phone_number=validated_data.get('phone_number', '')
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_customer', 'is_vendor', 'phone_number']

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # ডিফল্ট টোকেন ডেটা (access & refresh) নেওয়া
        data = super().validate(attrs)
        
        # ইউজারের অতিরিক্ত ডেটা রেসপন্সে যুক্ত করা
        data['id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['is_vendor'] = self.user.is_vendor
        data['is_customer'] = self.user.is_customer
        
        return data
