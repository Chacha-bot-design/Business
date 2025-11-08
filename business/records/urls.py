from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # Products
    path('products/', views.get_products, name='get_products'),
    path('products/create/', views.create_product, name='create_product'),
    
    # Transactions
    path('transactions/', views.get_transactions, name='get_transactions'),
    path('transactions/create/', views.create_transaction, name='create_transaction'),
    
    # Reports
    path('reports/generate_all_summaries/', views.generate_all_summaries, name='generate_all_summaries'),
    path('reports/generate/', views.generate_reports, name='generate_reports'),
]