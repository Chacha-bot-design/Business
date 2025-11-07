from django.contrib import admin
from .models import Product, Transaction, DailySummary, WeeklySummary, MonthlySummary, YearlySummary

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'current_stock', 'price', 'cost_price', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    # Remove profit_per_unit from readonly_fields since it's a method

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('product', 'transaction_type', 'quantity', 'unit_price', 'total_amount', 'profit', 'transaction_date')
    list_filter = ('transaction_type', 'transaction_date')
    search_fields = ('product__name', 'notes')
    readonly_fields = ('total_amount', 'profit')

@admin.register(DailySummary)
class DailySummaryAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_sales', 'total_purchases', 'total_transactions', 'profit_loss')
    list_filter = ('date',)
    ordering = ('-date',)
    readonly_fields = ('date', 'total_sales', 'total_purchases', 'total_transactions', 'profit_loss')

@admin.register(WeeklySummary)
class WeeklySummaryAdmin(admin.ModelAdmin):
    list_display = ('week_start', 'week_end', 'total_sales', 'total_purchases', 'total_transactions', 'profit_loss')
    list_filter = ('week_start',)
    ordering = ('-week_start',)
    readonly_fields = ('week_start', 'week_end', 'total_sales', 'total_purchases', 'total_transactions', 'profit_loss')

@admin.register(MonthlySummary)
class MonthlySummaryAdmin(admin.ModelAdmin):
    list_display = ('year', 'month', 'total_sales', 'total_purchases', 'total_transactions', 'profit_loss')
    list_filter = ('year', 'month')
    ordering = ('-year', '-month')
    readonly_fields = ('year', 'month', 'total_sales', 'total_purchases', 'total_transactions', 'profit_loss')

@admin.register(YearlySummary)
class YearlySummaryAdmin(admin.ModelAdmin):
    list_display = ('year', 'total_sales', 'total_purchases', 'total_transactions', 'profit_loss')
    list_filter = ('year',)
    ordering = ('-year',)
    readonly_fields = ('year', 'total_sales', 'total_purchases', 'total_transactions', 'profit_loss')