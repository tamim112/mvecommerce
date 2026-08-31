from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Category, SubCategory, Product
from .serializers import CategorySerializer, SubCategorySerializer, ProductSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status


# ১. ক্যাটাগরি এবং নেসটেড সাব-ক্যাটাগরি লিস্ট দেখার এপিআই (Public)
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny] # পাবলিকলি সবাই দেখতে পারবে

# ২. প্রোডাক্ট লিস্ট এবং নতুন প্রোডাক্ট যোগ করার এপিআই (Public Browsing + Auth Post)
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()] # ভেন্ডরদের প্রোডাক্ট যোগ করতে লগইন লাগবে
        return [permissions.AllowAny()] # কাস্টমারদের পাবলিকলি দেখতে লগইন লাগবে না

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)



class VendorStockUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        
        # সিকিউরিটি চেক - UserProfile এ is_vendor চেক করো
        try:
            user_profile = user.profile
            is_vendor = user_profile.is_vendor
        except:
            is_vendor = False
        
        if not is_vendor:
            return Response({"error": "Unauthorized! Only vendors allowed."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            # প্রোডাক্টটি এই ভেন্ডরের কি না তা নিশ্চিত করা
            product = Product.objects.get(pk=pk, vendor=user)
        except Product.DoesNotExist:
            return Response({"error": "Product not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

        # রিকোয়েস্ট পেলোড থেকে নতুন স্টক ভ্যালু নিয়ে আপডেট করা
        new_stock = request.data.get('stock')
        if new_stock is not None and int(new_stock) >= 0:
            product.stock = int(new_stock)
            product.save()
            
            # ফ্রন্টএন্ড স্টেট সিঙ্ক করার জন্য ফ্রেশ ডেটা রিটার্ন
            return Response({
                "message": "Stock updated successfully!",
                "id": product.id,
                "stock": product.stock
            }, status=status.HTTP_200_OK)
            
        return Response({"error": "Invalid stock value!"}, status=status.HTTP_400_BAD_REQUEST)
    
class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny] # প্রোডাক্ট সবাই দেখতে পাবে
