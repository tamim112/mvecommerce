from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    fk_name = 'user'
    extra = 0
    fields = (
        'phone_number',
        'address',
        'is_customer',
        'is_vendor',
        'vendor_status',
        'shop_name',
    )


class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'email')
        }),
        ('Account settings', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
    )
    list_display = ['username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'get_phone_number', 'get_vendor_status']
    list_filter = ['is_staff', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email', 'profile__phone_number', 'profile__shop_name']
    ordering = ['-id']

    def get_phone_number(self, obj):
        return obj.profile.phone_number if hasattr(obj, 'profile') else ''
    get_phone_number.short_description = 'Phone'

    def get_vendor_status(self, obj):
        return obj.profile.vendor_status if hasattr(obj, 'profile') else ''
    get_vendor_status.short_description = 'Vendor Status'


class UserProfileAdminForm(forms.ModelForm):
    first_name = forms.CharField(required=False, label='First Name')
    last_name = forms.CharField(required=False, label='Last Name')
    email = forms.EmailField(required=False, label='Email')

    class Meta:
        model = UserProfile
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.user_id:
            self.fields['first_name'].initial = self.instance.user.first_name
            self.fields['last_name'].initial = self.instance.user.last_name
            self.fields['email'].initial = self.instance.user.email

    def save(self, commit=True):
        instance = super().save(commit=False)
        user = instance.user
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        user.email = self.cleaned_data.get('email', '')
        user.save()
        if commit:
            instance.save()
        return instance


class UserProfileAdmin(admin.ModelAdmin):
    form = UserProfileAdminForm
    list_display = ['user', 'get_first_name', 'get_last_name', 'get_email', 'phone_number', 'address', 'is_customer', 'is_vendor', 'vendor_status', 'shop_name']
    list_filter = ['is_customer', 'is_vendor', 'vendor_status']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'user__email', 'phone_number', 'shop_name']
    ordering = ['-id']
    fieldsets = (
        ('Customer Information', {
            'fields': ('user', 'first_name', 'last_name', 'email', 'phone_number', 'address', 'is_customer', 'is_vendor', 'vendor_status', 'shop_name')
        }),
    )

    @admin.display(description='First Name')
    def get_first_name(self, obj):
        return obj.user.first_name if obj.user else ''

    @admin.display(description='Last Name')
    def get_last_name(self, obj):
        return obj.user.last_name if obj.user else ''

    @admin.display(description='Email')
    def get_email(self, obj):
        return obj.user.email if obj.user else ''

    actions = ['approve_selected_vendors', 'reject_selected_vendors']

    @admin.action(description='Approve selected pending merchant profiles')
    def approve_selected_vendors(self, request, queryset):
        for profile in queryset:
            profile.is_vendor = True
            profile.vendor_status = 'APPROVED'
            profile.is_customer = True
            profile.save()
        self.message_user(request, 'Selected merchant profiles approved successfully.')

    @admin.action(description='Reject selected merchant profiles')
    def reject_selected_vendors(self, request, queryset):
        for profile in queryset:
            profile.is_vendor = False
            profile.vendor_status = 'REJECTED'
            profile.save()
        self.message_user(request, 'Selected merchant profiles rejected successfully.')


admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
