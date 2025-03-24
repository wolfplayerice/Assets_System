from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from audit.models import AuditLog 
from django.urls import reverse

@login_required
def audit_log_view(request):
    logs = AuditLog.objects.filter(model_name='Category').order_by('-timestamp')
    return render(request, 'audit_log.html', {'logs': logs,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'list_audit_url': reverse('audit:logs_list'),
        })

@login_required
def logs_list(request):
    try:
        logs = AuditLog.objects.filter(model_name='Category').order_by('-timestamp')
        data = [
            {
                "user": log.user.username if log.user else "Anónimo",
                "action": log.action,
                "description": log.description,
                "timestamp": log.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            }
            for log in logs
        ]
        return JsonResponse({"data": data}, json_dumps_params={'ensure_ascii': False})
    except Exception as e:
        return JsonResponse({"error": str(e), "data": []}, status=500)