import os
import django

# Django এনভায়রনমেন্ট সেটআপ
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# লাইভ অ্যাডমিন অ্যাকাউন্টের ক্রিডেনশিয়ালস
username = "admin_live"
email = "admin@bazarhub.com"
password = "AdminLivePassword2026" # পাসওয়ার্ডটি মনে রাখবেন

if not User.objects.filter(username=username).exists():
    print("Creating live superuser...")
    User.objects.create_superuser(username=username, email=email, password=password)
    print("Superuser created successfully!")
else:
    print("Superuser already exists.")
