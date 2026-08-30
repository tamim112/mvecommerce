from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, VendorProfile

class CustomUserAdmin(UserAdmin):
    # Organise user details cleanly into dropdown sections inside the admin form
    fieldsets = UserAdmin.fieldsets + (
        ('System Multi-Role Selection', {'fields': ('is_customer', 'is_vendor')}),
        ('Extended Customer Information', {'fields': ('phone_number', 'shipping_address', 'profile_picture')}),
    )
    
    # Customise the columns displayed on the main admin list overview page
    list_display = ['username', 'email', 'phone_number', 'is_customer', 'is_vendor', 'is_staff']
    list_filter = ['is_customer', 'is_vendor', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'phone_number']
    ordering = ['-id']

class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ['shop_name', 'get_vendor_username', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['shop_name', 'user__username']
    actions = ['approve_selected_vendors'] # Quick checkbox actions for admins
    ordering = ['-created_at']

    # Custom function to pull vendor username into the shop overview column
    def get_vendor_username(self, obj):
        return obj.user.username
    get_vendor_username.short_description = 'Vendor Account'

    # Fast action menu to approve vendors in bulk directly from the list view
    @admin.action(description='Approve selected pending merchant profiles')
    def approve_selected_vendors(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, "Selected vendor profiles have been successfully activated.")

# Register models to reveal them instantly inside the Django Admin Dashboard Menu
admin.site.register(User, CustomUserAdmin)
admin.site.register(VendorProfile, VendorProfileAdmin)
