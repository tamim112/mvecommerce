from django.contrib import admin
from .models import Category, SubCategory, Product

class SubCategoryInline(admin.TabularInline):
    """Allows adding subcategories directly inside the main Category page"""
    model = SubCategory
    extra = 1
    prepopulated_fields = {'slug': ('name',)}

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [SubCategoryInline] # Embedded subcategory controller grid

class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_parent_category', 'slug']
    list_filter = ['category']
    search_fields = ['name', 'category__name']
    prepopulated_fields = {'slug': ('name',)}

    def get_parent_category(self, obj):
        return obj.category.name
    get_parent_category.short_description = 'Parent Category'

class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_vendor_name', 'get_subcategory_name', 'price', 'stock', 'is_available']
    list_filter = ['is_available', 'subcategory__category', 'created_at']
    search_fields = ['name', 'vendor__username', 'subcategory__name']
    list_editable = ['price', 'stock'] # Quick edit prices and quantities directly from the menu table
    ordering = ['-id']

    def get_vendor_name(self, obj):
        return obj.vendor.username
    get_vendor_name.short_description = 'Vendor'

    def get_subcategory_name(self, obj):
        return obj.subcategory.name if obj.subcategory else "General"
    get_subcategory_name.short_description = 'Subcategory'

admin.site.register(Category, CategoryAdmin)
admin.site.register(SubCategory, SubCategoryAdmin)
admin.site.register(Product, ProductAdmin)
