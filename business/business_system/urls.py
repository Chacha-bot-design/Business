# business_system/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('records.urls')),  # This should work now
    path('api-auth/', include('rest_framework.urls')),
]