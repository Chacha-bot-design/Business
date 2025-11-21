from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.db.models import Sum, Count, Avg
from .models import User, Product, Category, Sale, SaleItem, UserActivityLog, SystemSetting

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'employee_id', 'phone', 'is_active', 'date_joined', 'sales_performance')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'employee_id')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Business Information', {
            'fields': (
                'role', 'phone', 'address', 'employee_id', 
                'salary', 'date_of_birth', 'created_by'
            )
        }),
    )
    readonly_fields = ('employee_id', 'date_joined', 'created_by')
    
    def sales_performance(self, obj):
        if obj.role == 'SELLER':
            sales_data = Sale.objects.filter(seller=obj).aggregate(
                total_sales=Sum('total_amount'),
                total_profit=Sum('profit'),
                count=Count('id')
            )
            return format_html(
                'Sales: ${}<br>Profit: ${}<br>Transactions: {}',
                sales_data['total_sales'] or 0,
                sales_data['total_profit'] or 0,
                sales_data['count'] or 0
            )
        return '-'
    sales_performance.short_description = 'Performance'

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'cost_price', 'profit_margin_display', 'stock_quantity', 'min_stock_level', 'is_active', 'sales_performance')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'category__name')
    list_editable = ('price', 'stock_quantity', 'is_active')
    readonly_fields = ('created_at', 'updated_at')
    
    def profit_margin_display(self, obj):
        margin = obj.profit_margin()
        percentage = obj.profit_margin_percentage()
        color = 'green' if margin > 0 else 'red'
        return format_html(
            '<span style="color: {};">${} ({:.1f}%)</span>',
            color, margin, percentage
        )
    profit_margin_display.short_description = 'Profit Margin'
    
    def sales_performance(self, obj):
        sales_data = SaleItem.objects.filter(product=obj).aggregate(
            total_sold=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('unit_price')),
            total_profit=Sum('profit')
        )
        return format_html(
            'Sold: {}<br>Revenue: ${}<br>Profit: ${}',
            sales_data['total_sold'] or 0,
            sales_data['total_revenue'] or 0,
            sales_data['total_profit'] or 0
        )
    sales_performance.short_description = 'Sales Performance'

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'seller', 'total_amount', 'profit', 'profit_margin_percent', 'sale_date', 'payment_method', 'items_count')
    list_filter = ('sale_date', 'payment_method', 'seller__role')
    readonly_fields = ('sale_date',)
    search_fields = ('seller__username', 'id')
    date_hierarchy = 'sale_date'
    
    def profit_margin_percent(self, obj):
        if obj.total_amount > 0:
            percentage = (obj.profit / obj.total_amount) * 100
            color = 'green' if percentage > 0 else 'red'
            return format_html(
                '<span style="color: {};">{:.1f}%</span>',
                color, percentage
            )
        return '0%'
    profit_margin_percent.short_description = 'Profit Margin %'
    
    def items_count(self, obj):
        return obj.items.count()
    items_count.short_description = 'Items'

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ('sale', 'product', 'quantity', 'unit_price', 'profit', 'profit_margin')
    list_filter = ('sale__sale_date', 'product__category')
    search_fields = ('product__name', 'sale__id')
    
    def profit_margin(self, obj):
        if obj.unit_price > 0:
            percentage = (obj.profit / obj.unit_price) * 100
            color = 'green' if percentage > 0 else 'red'
            return format_html(
                '<span style="color: {};">{:.1f}%</span>',
                color, percentage
            )
        return '0%'
    profit_margin.short_description = 'Margin %'

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count', 'description')
    search_fields = ('name',)
    
    def product_count(self, obj):
        return obj.product_set.count()
    product_count.short_description = 'Products'

@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp', 'details_preview')
    list_filter = ('action', 'timestamp', 'user__role')
    search_fields = ('user__username', 'action')
    readonly_fields = ('user', 'action', 'timestamp', 'details')
    date_hierarchy = 'timestamp'
    
    def details_preview(self, obj):
        return str(obj.details)[:100] + '...' if len(str(obj.details)) > 100 else str(obj.details)
    details_preview.short_description = 'Details'
    
    def has_add_permission(self, request):
        return False

@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'description', 'updated_at')
    search_fields = ('key', 'description')
    readonly_fields = ('updated_at',)
    
    def has_delete_permission(self, request, obj=None):
        return False

# Custom admin site header and title
admin.site.site_header = 'Business System Administration'
admin.site.site_title = 'Business System Admin'
admin.site.index_title = 'System Management'