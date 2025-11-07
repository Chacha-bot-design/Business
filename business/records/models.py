from django.db import models
from django.utils import timezone

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    current_stock = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Selling Price")
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Buying Price")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def profit_per_unit(self):
        """Calculate profit per unit - handle None values"""
        if self.price is None or self.cost_price is None:
            return 0
        return self.price - self.cost_price
    
    def __str__(self):
        return self.name

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('SALE', 'Sale'),
        ('PURCHASE', 'Purchase'),
        ('RETURN', 'Return'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)
    
    # Add profit field
    profit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def save(self, *args, **kwargs):
        # Calculate total amount
        self.total_amount = self.quantity * self.unit_price
        
        # Calculate profit for SALES only
        if self.transaction_type == 'SALE':
            if self.product.cost_price is not None:
                self.profit = (self.unit_price - self.product.cost_price) * self.quantity
            else:
                self.profit = 0
        else:
            self.profit = 0
        
        # Update stock
        if self.transaction_type == 'SALE':
            if self.product.current_stock >= self.quantity:
                self.product.current_stock -= self.quantity
            else:
                raise ValueError("Insufficient stock")
        elif self.transaction_type == 'PURCHASE':
            self.product.current_stock += self.quantity
        elif self.transaction_type == 'RETURN':
            self.product.current_stock += self.quantity
            
        self.product.save()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.product.name} - {self.quantity} units"

class DailySummary(models.Model):
    date = models.DateField(unique=True)
    total_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_transactions = models.IntegerField(default=0)
    profit_loss = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Daily Summary - {self.date}"

class WeeklySummary(models.Model):
    week_start = models.DateField()
    week_end = models.DateField()
    total_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_transactions = models.IntegerField(default=0)
    profit_loss = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        unique_together = ['week_start', 'week_end']
        ordering = ['-week_start']
    
    def __str__(self):
        return f"Weekly Summary - {self.week_start} to {self.week_end}"

class MonthlySummary(models.Model):
    year = models.IntegerField()
    month = models.IntegerField()  # 1-12
    total_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_transactions = models.IntegerField(default=0)
    profit_loss = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        unique_together = ['year', 'month']
        ordering = ['-year', '-month']
    
    def __str__(self):
        return f"Monthly Summary - {self.month}/{self.year}"

class YearlySummary(models.Model):
    year = models.IntegerField(unique=True)
    total_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_transactions = models.IntegerField(default=0)
    profit_loss = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        ordering = ['-year']
    
    def __str__(self):
        return f"Yearly Summary - {self.year}"