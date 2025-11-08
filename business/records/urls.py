from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # Products - READ ONLY
    path('products/', views.get_products, name='get_products'),
    
    # Transactions - READ ONLY
    path('transactions/', views.get_transactions, name='get_transactions'),
    
    # Reports
    path('reports/generate_all_summaries/', views.generate_all_summaries, name='generate_all_summaries'),
    path('reports/generate/', views.generate_reports, name='generate_reports'),
]