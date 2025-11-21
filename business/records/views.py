# records/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, Avg, F
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta, datetime
import json
from .models import User, UserActivityLog, Product, Sale, SaleItem, Category, SystemSetting
from .serializers import (
    UserCreateSerializer, UserUpdateSerializer, UserListSerializer,
    ProductSerializer, LimitedProductSerializer, SaleSerializer,
    LimitedSaleSerializer, CategorySerializer, UserActivityLogSerializer,
    SystemSettingSerializer
)
from .permissions import IsBoss, IsManagerOrBoss, IsSeller

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsBoss]
    queryset = User.objects.all()
    
    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserListSerializer
    
    def perform_create(self, serializer):
        user = serializer.save(created_by=self.request.user)
        UserActivityLog.objects.create(
            user=self.request.user,
            action='USER_CREATED',
            details={
                'created_user_id': user.id,
                'created_user_username': user.username,
                'role': user.role
            }
        )
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('new_password')
        if not new_password:
            return Response(
                {"error": "New password is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)
        user.save()
        UserActivityLog.objects.create(
            user=request.user,
            action='PASSWORD_RESET',
            details={
                'target_user_id': user.id,
                'target_user_username': user.username
            }
        )
        return Response({"message": "Password reset successfully"})
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        users_by_role = User.objects.values('role').annotate(count=Count('id'))
        recent_signups = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=30)
        ).count()
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'recent_signups': recent_signups,
            'users_by_role': users_by_role
        })

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsBoss]
    
    @action(detail=False, methods=['get'])
    def daily_report(self, request):
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        
        # Today's sales
        today_sales = Sale.objects.filter(sale_date__date=today).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id'),
            avg_sale_value=Avg('total_amount')
        )
        
        # Yesterday's sales for comparison
        yesterday_sales = Sale.objects.filter(sale_date__date=yesterday).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        )
        
        # Top selling products today
        top_products_today = SaleItem.objects.filter(
            sale__sale_date__date=today
        ).values(
            'product__name'
        ).annotate(
            quantity_sold=Sum('quantity'),
            revenue=Sum(F('quantity') * F('unit_price')),
            profit=Sum('profit')
        ).order_by('-quantity_sold')[:10]
        
        # Sales by seller today
        sales_by_seller = Sale.objects.filter(
            sale_date__date=today
        ).values(
            'seller__username'
        ).annotate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        ).order_by('-total_sales')
        
        return Response({
            'date': today,
            'today_sales': today_sales,
            'yesterday_sales': yesterday_sales,
            'top_products_today': list(top_products_today),
            'sales_by_seller': list(sales_by_seller),
            'sales_growth': self._calculate_growth(
                today_sales.get('total_sales') or 0,
                yesterday_sales.get('total_sales') or 0
            )
        })
    
    @action(detail=False, methods=['get'])
    def weekly_report(self, request):
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_last_week = start_of_week - timedelta(days=7)
        
        # This week's sales
        week_sales = Sale.objects.filter(
            sale_date__date__gte=start_of_week
        ).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id'),
            avg_sale_value=Avg('total_amount')
        )
        
        # Last week's sales for comparison
        last_week_sales = Sale.objects.filter(
            sale_date__date__gte=start_of_last_week,
            sale_date__date__lt=start_of_week
        ).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        )
        
        # Daily breakdown for the week
        daily_breakdown = Sale.objects.filter(
            sale_date__date__gte=start_of_week
        ).annotate(
            day=TruncDate('sale_date')
        ).values('day').annotate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        ).order_by('day')
        
        # Top products for the week
        top_products_week = SaleItem.objects.filter(
            sale__sale_date__date__gte=start_of_week
        ).values(
            'product__name'
        ).annotate(
            quantity_sold=Sum('quantity'),
            revenue=Sum(F('quantity') * F('unit_price')),
            profit=Sum('profit')
        ).order_by('-quantity_sold')[:10]
        
        return Response({
            'week_start': start_of_week,
            'week_end': today,
            'week_sales': week_sales,
            'last_week_sales': last_week_sales,
            'daily_breakdown': list(daily_breakdown),
            'top_products_week': list(top_products_week),
            'sales_growth': self._calculate_growth(
                week_sales.get('total_sales') or 0,
                last_week_sales.get('total_sales') or 0
            )
        })
    
    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        start_of_last_month = (start_of_month - timedelta(days=1)).replace(day=1)
        
        # This month's sales
        month_sales = Sale.objects.filter(
            sale_date__date__gte=start_of_month
        ).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id'),
            avg_sale_value=Avg('total_amount')
        )
        
        # Last month's sales for comparison
        last_month_sales = Sale.objects.filter(
            sale_date__date__gte=start_of_last_month,
            sale_date__date__lt=start_of_month
        ).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        )
        
        # Weekly breakdown for the month
        weekly_breakdown = Sale.objects.filter(
            sale_date__date__gte=start_of_month
        ).annotate(
            week=TruncWeek('sale_date')
        ).values('week').annotate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        ).order_by('week')
        
        # Sales by category for the month
        sales_by_category = SaleItem.objects.filter(
            sale__sale_date__date__gte=start_of_month
        ).values(
            'product__category__name'
        ).annotate(
            quantity_sold=Sum('quantity'),
            revenue=Sum(F('quantity') * F('unit_price')),
            profit=Sum('profit')
        ).order_by('-revenue')
        
        # Top sellers for the month
        top_sellers = Sale.objects.filter(
            sale_date__date__gte=start_of_month
        ).values(
            'seller__username'
        ).annotate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id'),
            avg_sale_value=Avg('total_amount')
        ).order_by('-total_sales')[:10]
        
        return Response({
            'month': start_of_month.strftime('%B %Y'),
            'month_sales': month_sales,
            'last_month_sales': last_month_sales,
            'weekly_breakdown': list(weekly_breakdown),
            'sales_by_category': list(sales_by_category),
            'top_sellers': list(top_sellers),
            'sales_growth': self._calculate_growth(
                month_sales.get('total_sales') or 0,
                last_month_sales.get('total_sales') or 0
            )
        })
    
    @action(detail=False, methods=['get'])
    def comprehensive_report(self, request):
        """Comprehensive report with all time periods"""
        daily_report = self._get_daily_report_data()
        weekly_report = self._get_weekly_report_data()
        monthly_report = self._get_monthly_report_data()
        yearly_report = self._get_yearly_report_data()
        
        return Response({
            'daily': daily_report,
            'weekly': weekly_report,
            'monthly': monthly_report,
            'yearly': yearly_report,
            'summary': self._get_summary_stats()
        })
    
    def _calculate_growth(self, current, previous):
        if previous == 0:
            return 100 if current > 0 else 0
        return ((current - previous) / previous) * 100
    
    def _get_daily_report_data(self):
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        
        today_data = Sale.objects.filter(sale_date__date=today).aggregate(
            sales=Sum('total_amount'), profit=Sum('profit'), transactions=Count('id')
        )
        yesterday_data = Sale.objects.filter(sale_date__date=yesterday).aggregate(
            sales=Sum('total_amount'), profit=Sum('profit'), transactions=Count('id')
        )
        
        return {
            'date': today,
            'sales': today_data.get('sales') or 0,
            'profit': today_data.get('profit') or 0,
            'transactions': today_data.get('transactions') or 0,
            'growth': self._calculate_growth(
                today_data.get('sales') or 0,
                yesterday_data.get('sales') or 0
            )
        }
    
    def _get_weekly_report_data(self):
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_last_week = start_of_week - timedelta(days=7)
        
        week_data = Sale.objects.filter(sale_date__date__gte=start_of_week).aggregate(
            sales=Sum('total_amount'), profit=Sum('profit'), transactions=Count('id')
        )
        last_week_data = Sale.objects.filter(
            sale_date__date__gte=start_of_last_week,
            sale_date__date__lt=start_of_week
        ).aggregate(
            sales=Sum('total_amount'), profit=Sum('profit'), transactions=Count('id')
        )
        
        return {
            'week_start': start_of_week,
            'sales': week_data.get('sales') or 0,
            'profit': week_data.get('profit') or 0,
            'transactions': week_data.get('transactions') or 0,
            'growth': self._calculate_growth(
                week_data.get('sales') or 0,
                last_week_data.get('sales') or 0
            )
        }
    
    def _get_monthly_report_data(self):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        start_of_last_month = (start_of_month - timedelta(days=1)).replace(day=1)
        
        month_data = Sale.objects.filter(sale_date__date__gte=start_of_month).aggregate(
            sales=Sum('total_amount'), profit=Sum('profit'), transactions=Count('id')
        )
        last_month_data = Sale.objects.filter(
            sale_date__date__gte=start_of_last_month,
            sale_date__date__lt=start_of_month
        ).aggregate(
            sales=Sum('total_amount'), profit=Sum('profit'), transactions=Count('id')
        )
        
        return {
            'month': start_of_month.strftime('%B %Y'),
            'sales': month_data.get('sales') or 0,
            'profit': month_data.get('profit') or 0,
            'transactions': month_data.get('transactions') or 0,
            'growth': self._calculate_growth(
                month_data.get('sales') or 0,
                last_month_data.get('sales') or 0
            )
        }
    
    def _get_yearly_report_data(self):
        today = timezone.now().date()
        start_of_year = today.replace(month=1, day=1)
        start_of_last_year = start_of_year.replace(year=start_of_year.year-1)
        
        year_data = Sale.objects.filter(sale_date__date__gte=start_of_year).aggregate(
            sales=Sum('total_amount'), profit=Sum('profit'), transactions=Count('id')
        )
        last_year_data = Sale.objects.filter(
            sale_date__date__gte=start_of_last_year,
            sale_date__date__lt=start_of_year
        ).aggregate(
            sales=Sum('total_amount'), profit=Sum('profit'), transactions=Count('id')
        )
        
        return {
            'year': start_of_year.year,
            'sales': year_data.get('sales') or 0,
            'profit': year_data.get('profit') or 0,
            'transactions': year_data.get('transactions') or 0,
            'growth': self._calculate_growth(
                year_data.get('sales') or 0,
                last_year_data.get('sales') or 0
            )
        }
    
    def _get_summary_stats(self):
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        low_stock_products = Product.objects.filter(stock_quantity__lte=F('min_stock_level')).count()
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        return {
            'total_products': total_products,
            'active_products': active_products,
            'low_stock_products': low_stock_products,
            'total_users': total_users,
            'active_users': active_users
        }

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    
    def get_queryset(self):
        if self.request.user.role == 'SELLER':
            return Product.objects.filter(is_active=True)
        return Product.objects.all()
    
    def get_serializer_class(self):
        if self.request.user.role != 'BOSS':
            return LimitedProductSerializer
        return ProductSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            permission_classes = [IsManagerOrBoss | IsBoss]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    queryset = Sale.objects.all()
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'SELLER':
            return Sale.objects.filter(seller=user)
        elif user.role in ['MANAGER', 'BOSS']:
            return Sale.objects.all()
        return Sale.objects.none()
    
    def get_serializer_class(self):
        if self.request.user.role != 'BOSS':
            return LimitedSaleSerializer
        return SaleSerializer
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsSeller]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'], permission_classes=[IsBoss])
    def profit_loss_report(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        year_ago = today - timedelta(days=365)
        
        daily_sales = Sale.objects.filter(sale_date__date=today).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        )
        weekly_sales = Sale.objects.filter(sale_date__date__gte=week_ago).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        )
        monthly_sales = Sale.objects.filter(sale_date__date__gte=month_ago).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        )
        yearly_sales = Sale.objects.filter(sale_date__date__gte=year_ago).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        )
        top_products = SaleItem.objects.values(
            'product__name'
        ).annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('unit_price')),
            total_profit=Sum('profit')
        ).order_by('-total_profit')[:10]
        
        return Response({
            'daily': daily_sales,
            'weekly': weekly_sales,
            'monthly': monthly_sales,
            'yearly': yearly_sales,
            'top_products': list(top_products),
            'report_generated': timezone.now()
        })

class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsManagerOrBoss | IsBoss]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class UserActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsBoss]
    serializer_class = UserActivityLogSerializer
    queryset = UserActivityLog.objects.all().select_related('user')

class SystemSettingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsBoss]
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer