from django.urls import path
from .views import CartListCreateView, OrderCreateView, CartDetailView, CustomerOrderHistoryView, VendorDashboardStatsView # নতুন ইম্পোর্ট

urlpatterns = [
    path('cart/', CartListCreateView.as_view(), name='cart-list'),
    path('cart/<int:pk>/', CartDetailView.as_view(), name='cart-detail'), # আইডি ধরে আপডেট/ডিলিট করার জন্য
    path('checkout/', OrderCreateView.as_view(), name='checkout'),
    path('customer/orders/', CustomerOrderHistoryView.as_view(), name='customer-order-history'),
    path('vendor/stats/', VendorDashboardStatsView.as_view(), name='vendor-dashboard-stats'),
]
