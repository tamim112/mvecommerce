from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView
from .serializers import CustomTokenObtainPairSerializer # নতুন ইম্পোর্ট

# কাস্টম ভেন্ডেড ভিউ তৈরি
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    
    # বিল্ট-ইন ভিউর জায়গায় আমাদের কাস্টম ভিউটি বসিয়ে দিন
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
