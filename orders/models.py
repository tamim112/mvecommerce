from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

# ১. শপিং কার্ট মডেল (ইউজারের কার্ট সেশন ধরে রাখার জন্য)
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"

    # প্রতিটি আইটেমের টোটাল প্রাইস বের করার মেথড
    @property
    def total_price(self):
        return self.product.price * self.quantity


# ২. অর্ডার মডেল (মূল অর্ডারের সামারি)
class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.TextField()
    phone_number = models.CharField(max_length=15)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"


# ৩. অর্ডার আইটেম মডেল (একটি অর্ডারের ভেতরে কি কি প্রোডাক্ট ছিল তার ডিটেইলস)
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    vendor = models.ForeignKey(User, on_delete=models.CASCADE) # কোন ভেন্ডরের প্রোডাক্ট তা ট্র্যাক করার জন্য
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2) # অর্ডার করার সময় প্রোডাক্টের দাম কত ছিল

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
