from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
import json

# Health check endpoint
@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'Business System API',
        'message': 'Service is running correctly'
    })

# Products endpoints - READ ONLY
@csrf_exempt
@require_http_methods(["GET"])
def get_products(request):
    """Return list of products (read-only)"""
    try:
        # For now, return empty array - you'll add real data via admin
        products = []
        
        return JsonResponse({
            'success': True,
            'products': products,
            'count': len(products),
            'message': 'Use Django admin to add products'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

# Transactions endpoints - READ ONLY  
@csrf_exempt
@require_http_methods(["GET"])
def get_transactions(request):
    """Return list of transactions (read-only)"""
    try:
        transactions = []
        
        return JsonResponse({
            'success': True,
            'transactions': transactions,
            'count': len(transactions)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

# Reports endpoints
@csrf_exempt
@require_http_methods(["GET"])
def generate_all_summaries(request):
    """Generate reports with basic stats"""
    try:
        reports_data = {
            'sales_summary': {
                'total_sales': 0,
                'monthly_sales': 0,
                'weekly_sales': 0
            },
            'inventory_status': {
                'total_products': 0,
                'low_stock': 0,
                'out_of_stock': 0
            },
            'message': 'Add products via Django admin to see reports'
        }
        
        return JsonResponse({
            'success': True,
            'reports': reports_data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def generate_reports(request):
    """Generate basic reports"""
    try:
        report_data = {
            'sales_data': [],
            'top_products': [],
            'summary': {
                'total_revenue': 0,
                'total_sales': 0,
                'active_products': 0
            }
        }
        
        return JsonResponse({
            'success': True,
            'data': report_data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)