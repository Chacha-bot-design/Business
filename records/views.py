from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Product, Transaction, DailySummary, WeeklySummary, MonthlySummary, YearlySummary
from .serializers import ProductSerializer, TransactionSerializer, DailySummarySerializer, WeeklySummarySerializer, MonthlySummarySerializer, YearlySummarySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-transaction_date')
    serializer_class = TransactionSerializer
    
    def perform_create(self, serializer):
        serializer.save()

class DailySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DailySummary.objects.all()
    serializer_class = DailySummarySerializer

class WeeklySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeeklySummary.objects.all()
    serializer_class = WeeklySummarySerializer

class MonthlySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MonthlySummary.objects.all()
    serializer_class = MonthlySummarySerializer

class YearlySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YearlySummary.objects.all()
    serializer_class = YearlySummarySerializer

class ReportViewSet(viewsets.ViewSet):
    
    def get_week_range(self, date):
        """Get the start and end date of the week for a given date"""
        start = date - timedelta(days=date.weekday())
        end = start + timedelta(days=6)
        return start, end
    
    @action(detail=False, methods=['get'])
    def generate_all_summaries(self, request):
        today = timezone.now().date()
        current_year = today.year
        current_month = today.month
        
        # DAILY SUMMARY
        daily_summary, created = DailySummary.objects.get_or_create(date=today)
        today_transactions = Transaction.objects.filter(transaction_date__date=today)
        
        # Calculate using profit field for accurate results
        daily_sales = today_transactions.filter(transaction_type='SALE').aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        
        daily_purchases = today_transactions.filter(transaction_type='PURCHASE').aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        
        # Use the profit field that's already calculated
        daily_profit = today_transactions.filter(transaction_type='SALE').aggregate(
            Sum('profit')
        )['profit__sum'] or 0
        
        daily_summary.total_sales = daily_sales
        daily_summary.total_purchases = daily_purchases
        daily_summary.total_transactions = today_transactions.count()
        daily_summary.profit_loss = daily_profit
        daily_summary.save()
        
        # WEEKLY SUMMARY
        week_start, week_end = self.get_week_range(today)
        weekly_summary, created = WeeklySummary.objects.get_or_create(
            week_start=week_start,
            week_end=week_end
        )
        
        weekly_transactions = Transaction.objects.filter(
            transaction_date__date__range=[week_start, week_end]
        )
        
        weekly_sales = weekly_transactions.filter(transaction_type='SALE').aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        
        weekly_purchases = weekly_transactions.filter(transaction_type='PURCHASE').aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        
        weekly_profit = weekly_transactions.filter(transaction_type='SALE').aggregate(
            Sum('profit')
        )['profit__sum'] or 0
        
        weekly_summary.total_sales = weekly_sales
        weekly_summary.total_purchases = weekly_purchases
        weekly_summary.total_transactions = weekly_transactions.count()
        weekly_summary.profit_loss = weekly_profit
        weekly_summary.save()
        
        # MONTHLY SUMMARY
        monthly_summary, created = MonthlySummary.objects.get_or_create(
            year=current_year,
            month=current_month
        )
        
        monthly_transactions = Transaction.objects.filter(
            transaction_date__year=current_year,
            transaction_date__month=current_month
        )
        
        monthly_sales = monthly_transactions.filter(transaction_type='SALE').aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        
        monthly_purchases = monthly_transactions.filter(transaction_type='PURCHASE').aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        
        monthly_profit = monthly_transactions.filter(transaction_type='SALE').aggregate(
            Sum('profit')
        )['profit__sum'] or 0
        
        monthly_summary.total_sales = monthly_sales
        monthly_summary.total_purchases = monthly_purchases
        monthly_summary.total_transactions = monthly_transactions.count()
        monthly_summary.profit_loss = monthly_profit
        monthly_summary.save()
        
        # YEARLY SUMMARY
        yearly_summary, created = YearlySummary.objects.get_or_create(year=current_year)
        
        yearly_transactions = Transaction.objects.filter(transaction_date__year=current_year)
        
        yearly_sales = yearly_transactions.filter(transaction_type='SALE').aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        
        yearly_purchases = yearly_transactions.filter(transaction_type='PURCHASE').aggregate(
            Sum('total_amount')
        )['total_amount__sum'] or 0
        
        yearly_profit = yearly_transactions.filter(transaction_type='SALE').aggregate(
            Sum('profit')
        )['profit__sum'] or 0
        
        yearly_summary.total_sales = yearly_sales
        yearly_summary.total_purchases = yearly_purchases
        yearly_summary.total_transactions = yearly_transactions.count()
        yearly_summary.profit_loss = yearly_profit
        yearly_summary.save()
        
        report_data = {
            'daily': {
                'date': today.strftime('%Y-%m-%d'),
                'sales': float(daily_sales),
                'purchases': float(daily_purchases),
                'profit_loss': float(daily_profit),
                'transactions': today_transactions.count()
            },
            'weekly': {
                'period': f"{week_start.strftime('%Y-%m-%d')} to {week_end.strftime('%Y-%m-%d')}",
                'sales': float(weekly_sales),
                'purchases': float(weekly_purchases),
                'profit_loss': float(weekly_profit),
                'transactions': weekly_transactions.count()
            },
            'monthly': {
                'period': f"{current_month}/{current_year}",
                'sales': float(monthly_sales),
                'purchases': float(monthly_purchases),
                'profit_loss': float(monthly_profit),
                'transactions': monthly_transactions.count()
            },
            'yearly': {
                'year': current_year,
                'sales': float(yearly_sales),
                'purchases': float(yearly_purchases),
                'profit_loss': float(yearly_profit),
                'transactions': yearly_transactions.count()
            }
        }
        
        return Response(report_data)
    
    @action(detail=False, methods=['get'])
    def get_historical_summaries(self, request):
        """Get all historical summaries"""
        daily_summaries = DailySummary.objects.all()[:30]  # Last 30 days
        weekly_summaries = WeeklySummary.objects.all()[:12]  # Last 12 weeks
        monthly_summaries = MonthlySummary.objects.all()[:12]  # Last 12 months
        yearly_summaries = YearlySummary.objects.all()[:5]  # Last 5 years
        
        data = {
            'daily': DailySummarySerializer(daily_summaries, many=True).data,
            'weekly': WeeklySummarySerializer(weekly_summaries, many=True).data,
            'monthly': MonthlySummarySerializer(monthly_summaries, many=True).data,
            'yearly': YearlySummarySerializer(yearly_summaries, many=True).data,
        }
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_stock_products = Product.objects.filter(current_stock__lt=10)
        serializer = ProductSerializer(low_stock_products, many=True)
        return Response(serializer.data)