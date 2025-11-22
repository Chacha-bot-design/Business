# records/models.py
from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('DATA_PLANS', 'Data Plans'),
        ('ROUTERS', 'Routers'),
        ('BUNDLES', 'Bundles'),
        ('ACCESSORIES', 'Accessories'),
    ]
    
    name = models.CharField(max_length=200, default='Product')
    category_name = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='DATA_PLANS')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_quantity = models.IntegerField(default=0)
    min_stock_level = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def profit_margin(self):
        return float(self.price) - float(self.cost_price)

class Sale(models.Model):
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('CARD', 'Card'),
        ('MOMO', 'Mobile Money'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales')
    quantity = models.IntegerField(default=1)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    profit = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS, default='CASH')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sales')
    sale_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_amount = self.quantity * self.sale_price
        if self.product:
            self.profit = self.quantity * (self.sale_price - self.product.cost_price)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Sale #{self.id} - {self.product.name if self.product else 'No Product'}"