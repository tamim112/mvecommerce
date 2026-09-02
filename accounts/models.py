from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# ১. 'models.models.Model' ফিক্স করে 'models.Model' করা হয়েছে
class UserProfile(models.Model):
    # জ্যাঙ্গোর অলরেডি তৈরি থাকা ইউজারের সাথে ওয়ান-টু-ওয়ান রিলেশন
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # ৩-টাইপ ইউজার রোল ফ্ল্যাগস
    is_customer = models.BooleanField(default=True) # সবাই ডিফল্ট কাস্টমার
    is_vendor = models.BooleanField(default=False)   # অ্যাডমিন অ্যাপ্রুভ করলে True হবে

    # ভেন্ডর রিকোয়েস্ট ট্র্যাকিং স্ট্যাটাস
    VENDOR_STATUS_CHOICES = [
        ('NONE', 'None'),
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    vendor_status = models.CharField(max_length=15, choices=VENDOR_STATUS_CHOICES, default='NONE')
    
    # অতিরিক্ত তথ্যাদি
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    shop_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# 🔥 অলরেডি থাকা বা নতুন যেকোনো ইউজার তৈরি হওয়ার সাথে সাথে অটো প্রোফাইল ক্রিয়েট করার সিগন্যাল
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # ২. সেভ করার সময় রিকার্সন (Infinite Loop) এরর এড়াতে 'else' ব্লকে নেওয়া নিরাপদ
        instance.profile.save()
