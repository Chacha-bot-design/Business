# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('BOSS', 'Boss'),
        ('MANAGER', 'Manager'),
        ('SELLER', 'Seller'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='SELLER')
    phone = models.CharField(max_length=20, blank=True, default='')
    employee_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.role}"