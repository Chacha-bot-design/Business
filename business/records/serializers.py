# records/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, Sale

User = get_user_model()

class ProductSerializer(serializers.ModelSerializer):
    profit_margin = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ('total_amount', 'profit', 'seller', 'sale_date')