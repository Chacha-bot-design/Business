from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include

def home(request):
  return HttpResponse("API backend running")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('records.urls')),
    path('', home),
]