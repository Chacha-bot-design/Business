# records/urls.py
from django.urls import path
from .views import profit_loss_report, create_test_data

# Use simple paths for now - we'll add ViewSets later
urlpatterns = [
    path('profit_loss_report/', profit_loss_report, name='profit-loss-report'),
    path('create-test-data/', create_test_data, name='create-test-data'),
]