# records/admin.py
from django.contrib import admin
from .models import Product, Sale

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_name', 'price', 'cost_price', 'profit_margin', 'stock_quantity', 'min_stock_level', 'is_active', 'created_at']
    list_filter = ['category_name', 'is_active', 'created_at']
    search_fields = ['name', 'category_name']
    list_editable = ['price', 'cost_price', 'stock_quantity', 'min_stock_level', 'is_active']
    readonly_fields = ['created_at', 'updated_at']
    
    def profit_margin(self, obj):
        return f"${obj.profit_margin:,.2f}"
    profit_margin.short_description = 'Profit Margin'

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'quantity', 'sale_price', 'total_amount', 'profit', 'payment_method', 'seller', 'sale_date']
    list_filter = ['payment_method', 'sale_date', 'seller', 'product__category_name']
    search_fields = ['product__name', 'seller__username']
    readonly_fields = ['total_amount', 'profit', 'sale_date']
    date_hierarchy = 'sale_date'