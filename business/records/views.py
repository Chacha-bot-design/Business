# records/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model  # Use this instead of direct import

# Get the custom User model
User = get_user_model()

from .models import Product, Sale  # Remove User from this import
from .serializers import ProductSerializer, SaleSerializer

class IsBoss(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'BOSS'

class IsBossOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['BOSS', 'MANAGER']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Product.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_stock_products = Product.objects.filter(
            stock_quantity__lte=models.F('min_stock_level'),
            is_active=True
        )
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()  # Add this line
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role'):
            if user.role in ['BOSS', 'MANAGER']:
                return Sale.objects.all()
        return Sale.objects.filter(seller=user)

    def perform_create(self, serializer):
        sale = serializer.save(seller=self.request.user)
        # Update product stock
        product = sale.product
        product.stock_quantity -= sale.quantity
        product.save()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profit_loss_report(request):
    try:
        # Check if user is boss
        if not hasattr(request.user, 'role') or request.user.role != 'BOSS':
            return Response(
                {'error': 'Only BOSS can access profit reports'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        today = timezone.now().date()
        
        # Daily stats
        daily_sales = Sale.objects.filter(sale_date__date=today).aggregate(
            total_sales=Sum('total_amount'),
            total_profit=Sum('profit'),
            transaction_count=Count('id')
        )
        
        return Response({
            'daily': {
                'total_sales': float(daily_sales['total_sales'] or 0),
                'total_profit': float(daily_sales['total_profit'] or 0),
                'transaction_count': daily_sales['transaction_count'] or 0
            },
            'weekly': {
                'total_sales': 0,
                'total_profit': 0,
                'transaction_count': 0
            },
            'monthly': {
                'total_sales': 0,
                'total_profit': 0,
                'transaction_count': 0
            },
            'top_products': []
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_test_data(request):
    """Create test data for development"""
    try:
        # Create test users
        boss_user = User.objects.create_user(
            username='boss',
            email='boss@company.com',
            password='password',
            role='BOSS',
            employee_id='BOSS001'
        )
        
        manager_user = User.objects.create_user(
            username='manager',
            email='manager@company.com',
            password='password',
            role='MANAGER',
            employee_id='MGR001'
        )
        
        # Create products
        products_data = [
            {'name': '4G Data Plan 10GB', 'category_name': 'DATA_PLANS', 'price': 25000, 'cost_price': 15000, 'stock_quantity': 100},
            {'name': 'Fiber Optic Router', 'category_name': 'ROUTERS', 'price': 299999, 'cost_price': 199999, 'stock_quantity': 15},
        ]
        
        for product_data in products_data:
            Product.objects.create(**product_data)
        
        return Response({'message': 'Test data created successfully'})
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)