from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
# 🔥 ফিক্স: আপনার তৈরি করা প্রোফাইল মডেলটি এখানে ইম্পোর্ট করতে হবে
from .models import UserProfile  

# 1️⃣ প্রথমে জ্যাঙ্গোর ডিফল্ট ইউজার রেজিস্ট্রেশনটি আন-রেজিস্টার (Unregister) করতে হবে
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

class CustomUserAdmin(UserAdmin):
    # ইনলাইন ফিল্ডসেট অর্গানাইজেশন (ডিফল্ট ফিল্ডের সাথে কাস্টম ফিল্ড অ্যাড করা)
    # নোট: প্রোফাইল রিলেটেড কোনো ওয়ান-টু-ওয়ান ফিল্ড থাকলে তা ইনলাইন হিসেবে দেখানোটাই স্ট্যান্ডার্ড, 
    # অথবা আপনার মডেলে সরাসরি এক্সটেন্ডেড ফিল্ড থাকলে এভাবে রাখা যাবে।
    fieldsets = UserAdmin.fieldsets + (
        ('System Multi-Role Selection', {'fields': ('is_customer', 'is_vendor')}) if hasattr(User, 'is_customer') else (None, {'fields': ()}),
    )
    
    list_display = ['username', 'email', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active']
    search_fields = ['username', 'email']
    ordering = ['-id']

# 2️⃣ ভেন্ডর প্রোফাইল এডমিন ম্যানেজার
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ['shop_name', 'get_vendor_username', 'vendor_status', 'phone_number']
    list_filter = ['vendor_status']
    search_fields = ['shop_name', 'user__username', 'phone_number']
    actions = ['approve_selected_vendors', 'reject_selected_vendors'] # চেইন্ড একশন মেনু
    ordering = ['-id']

    # ভেন্ডরের ইউজারনেম কলামে নিয়ে আসার কাস্টম মেথড
    def get_vendor_username(self, obj):
        return obj.user.username
    get_vendor_username.short_description = 'Vendor Account'

    # 🚀 ওয়ান-ক্লিক বাল্ক অ্যাপ্রুভাল একশন
    @admin.action(description='Approve selected pending merchant profiles')
    def approve_selected_vendors(self, request, queryset):
        for profile in queryset:
            profile.is_vendor = True
            profile.vendor_status = 'APPROVED'
            profile.is_customer = True
            profile.save()
        self.message_user(request, "নির্বাচিত কাস্টমারদের ভেন্ডর অ্যাকাউন্ট সফলভাবে সচল (APPROVED) করা হয়েছে।")

    # 🛑 ওয়ান-ক্লিক বাল্ক রিজেকশন একশন
    @admin.action(description='Reject selected merchant profiles')
    def reject_selected_vendors(self, request, queryset):
        for profile in queryset:
            profile.is_vendor = False
            profile.vendor_status = 'REJECTED'
            profile.save()
        self.message_user(request, "নির্বাচিত রিকোয়েস্টগুলো বাতিল (REJECTED) করা হয়েছে।")

# 3️⃣ ফাইনাল মডেল রেজিস্ট্রেশন (সঠিক ট্যাগ ক্রমানুসারে)
admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile, VendorProfileAdmin) # 🔥 ফিক্স: মডেল এবং এডমিন ক্লাস দুটিই পাস করা হলো
