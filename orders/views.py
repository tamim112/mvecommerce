from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Cart, Order, OrderItem
from .serializers import CartSerializer, OrderSerializer, OrderItemSerializer
from products.models import Product
from rest_framework.views import APIView
from django.db.models import Sum, Count


# কার্ট লিস্ট দেখা এবং কার্টে আইটেম যোগ করার এপিআই
class CartListCreateView(generics.ListCreateAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated] # কার্ট ব্যবহারের জন্য লগইন বাধ্যতামূলক

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)
        
        # কার্টে যদি প্রোডাক্টটি আগেই থাকে তবে কোয়ান্টিটি বাড়িয়ে দেওয়া
        existing_cart = Cart.objects.filter(user=self.request.user, product=product).first()
        if existing_cart:
            existing_cart.quantity += quantity
            existing_cart.save()
        else:
            serializer.save(user=self.request.user)

# অর্ডার তৈরি করার এপিআই (Checkout)
class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        cart_items = Cart.objects.filter(user=user)

        if not cart_items.exists():
            return Response({"error": "Your cart is empty!"}, status=status.HTTP_400_BAD_REQUEST)

        shipping_address = request.data.get('shipping_address')
        phone_number = request.data.get('phone_number')

        if not shipping_address or not phone_number:
            return Response({"error": "Shipping address and phone number are required!"}, status=status.HTTP_400_BAD_REQUEST)

        # ১. টোটাল অ্যামাউন্ট হিসাব করা এবং স্টক চেক করা
        total_amount = 0
        for item in cart_items:
            if item.product.stock < item.quantity:
                return Response({"error": f"Not enough stock for {item.product.name}!"}, status=status.HTTP_400_BAD_REQUEST)
            total_amount += item.total_price

        # ২. অর্ডার মেইন অবজেক্ট তৈরি
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            shipping_address=shipping_address,
            phone_number=phone_number
        )

        # ৩. অর্ডার আইটেম তৈরি এবং প্রোডাক্টের স্টক কমানো
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                vendor=item.product.vendor,
                quantity=item.quantity,
                price=item.product.price
            )
            # ইনভেন্টরি আপডেট (স্টক কমানো)
            item.product.stock -= item.quantity
            item.product.save()

        # ৪. অর্ডার হয়ে যাওয়ার পর কার্ট খালি করে দেওয়া
        cart_items.delete()

        return Response({
            "message": "Order placed successfully!",
            "order_id": order.id,
            "total_amount": order.total_amount
        }, status=status.HTTP_201_CREATED)


# কার্ট আইটেম আপডেট (কোয়ান্টিটি চেঞ্জ) এবং ডিলিট করার এপিআই
class CartDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    


# 🔥 নতুন যুক্ত করা হলো: শুধুমাত্র লগইন থাকা কাস্টমারের আগের সব অর্ডার হিস্ট্রি লিস্ট আকারে রিভ করা
class CustomerOrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated] # অবশ্যই লগইন টোকেন লাগবে

    def get_queryset(self):
        # রিকোয়েস্ট থেকে ইউজারকে চিনে তার করা অর্ডারগুলো শুধু ডেটাবেজ থেকে ফিল্টার করবে
        return Order.objects.filter(user=self.request.user).order_by('-id')
    
    
    
    

class VendorDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # ১. নিরাপত্তা চেক: ইউজার ভেন্ডর বা বিক্রেতা কি না
        try:
            user_profile = user.profile
            is_vendor = user_profile.is_vendor
        except:
            is_vendor = False
        
        if not is_vendor:
            return Response({"error": "Unauthorized! Only vendors can access this dashboard."}, status=status.HTTP_403_FORBIDDEN)

        # ২. এই ভেন্ডরের আন্ডারে যতগুলো প্রোডাক্ট সেল হয়েছে বা অর্ডার এসেছে সেগুলো ফিল্টার করা
        vendor_sales = OrderItem.objects.filter(vendor=user).order_by('-id')

        # ৩. গুরুত্বপূর্ণ ডাটা অ্যানালিটিক্স ক্যালকুলেশন (টোটাল রেভিনিউ, টোটাল আইটেম সোল্ড, একটিভ অর্ডার কাউন্ট)
        total_revenue = sum(item.quantity * item.price for item in vendor_sales)
        total_items_sold = vendor_sales.aggregate(total=Sum('quantity'))['total'] or 0
        total_orders_count = vendor_sales.values('order').distinct().count()

        # ৪. ফ্রন্টএন্ডের জন্য ক্লিন অবজেক্ট ফরমেটে সিরিয়ালাইজড ডাটা রেডি করা
        serialized_items = OrderItemSerializer(vendor_sales, many=True).data

        return Response({
            "analytics": {
                "total_revenue": int(total_revenue),
                "total_items_sold": total_items_sold,
                "total_orders_count": total_orders_count
            },
            "sales_orders": serialized_items})

