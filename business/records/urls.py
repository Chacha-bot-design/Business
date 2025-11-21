# records/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'user-activities', views.UserActivityLogViewSet, basename='useractivity')
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'sales', views.SaleViewSet, basename='sale')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'system-settings', views.SystemSettingViewSet, basename='systemsetting')
router.register(r'reports', views.ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]