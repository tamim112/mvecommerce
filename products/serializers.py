from rest_framework import serializers
from .models import Category, SubCategory, Product

# ১. সাব-ক্যাটাগরি সিরিয়ালাইজার
# ১. সাব-ক্যাটাগরি সিরিয়ালাইজার (ইমেজসহ)
class SubCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = SubCategory
        fields = ['id', 'category', 'category_name', 'name', 'slug', 'image'] # 🔥 'image' যুক্ত করা হলো

# ২. ক্যাটাগরি সিরিয়ালাইজার (এর ভেতরে সাব-ক্যাটাগরি লিস্ট নেসটেড থাকবে)
class CategorySerializer(serializers.ModelSerializer):
    # 'subcategories' নামটি models.py-এর related_name-এর সাথে মিল থাকতে হবে
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'subcategories']

# ৩. 🔥 ফাইনাল মাস্টার প্রোডাক্ট সিরিয়ালাইজার (সব ফিচার একসাথে সিঙ্কড)
class ProductSerializer(serializers.ModelSerializer):
    vendor = serializers.PrimaryKeyRelatedField(read_only=True)
    vendor_id = serializers.IntegerField(source='vendor.id', read_only=True) # 🔥 ভেন্ডর আইডি ট্র্যাকিং
    vendor_username = serializers.CharField(source='vendor.username', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    category_id = serializers.IntegerField(source='subcategory.category.id', read_only=True)

    class Meta:
        model = Product
        # হোম পেজ এবং ভেন্ডর ড্যাশবোর্ড দুটির জন্যই প্রয়োজনীয় সব ফিল্ড একসাথে লকডাউন
        fields = [
            'id', 'vendor', 'vendor_id', 'vendor_username', 'subcategory', 'subcategory_name', 'category_id',
            'name', 'description', 'price', 'stock', 'unit', 'is_available', 'image', 'created_at'
        ]