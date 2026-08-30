from rest_framework import serializers
from .models import Cart, Order, OrderItem
from products.serializers import ProductSerializer

class CartSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'product', 'product_details', 'quantity', 'total_price']



class OrderItemSerializer(serializers.ModelSerializer):
    # 🌟 প্রোডাক্টের নাম ডাইনামিকালি টেনে আনা (কারণ মডেলে সরাসরি product_name নামে কোনো ফিল্ড নেই)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    # 🔥 ফিক্স: source='price' সম্পূর্ণ রিমুভ করা হলো, কারণ মডেলে অলরেডি 'price' ফিল্ড আছে।
    # এটি রাখার কারণে Django AssertionError দিচ্ছিল।
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    # 🌟 মডেলে related_name='items' থাকায় এখানে ভেরিয়েবল নাম 'items' রাখা হলো
    items = OrderItemSerializer(many=True, read_only=True) 

    class Meta:
        model = Order
        fields = ['id', 'user', 'shipping_address', 'phone_number', 'total_amount', 'status', 'is_paid', 'items', 'created_at']
