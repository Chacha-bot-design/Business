from rest_framework import serializers
from .models import Product, Transaction, DailySummary, WeeklySummary, MonthlySummary, YearlySummary

class ProductSerializer(serializers.ModelSerializer):
    # Remove profit_per_unit since it's a method
    class Meta:
        model = Product
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'

class DailySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySummary
        fields = '__all__'

class WeeklySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklySummary
        fields = '__all__'

class MonthlySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlySummary
        fields = '__all__'

class YearlySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = YearlySummary
        fields = '__all__'