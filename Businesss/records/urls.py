from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet)
router.register(r'transactions', views.TransactionViewSet)
router.register(r'daily-summaries', views.DailySummaryViewSet)
router.register(r'weekly-summaries', views.WeeklySummaryViewSet)
router.register(r'monthly-summaries', views.MonthlySummaryViewSet)
router.register(r'yearly-summaries', views.YearlySummaryViewSet)
router.register(r'reports', views.ReportViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
]