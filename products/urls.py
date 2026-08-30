from django.urls import path
from .views import CategoryListCreateView, ProductListCreateView,VendorStockUpdateView,ProductListView

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('products/', ProductListCreateView.as_view(), name='product-create'),
    
    path('list/', ProductListView.as_view(), name='product-list-all'),
    path('vendor/stock/<int:pk>/', VendorStockUpdateView.as_view(), name='vendor-stock-update'),
]
