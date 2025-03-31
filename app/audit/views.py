from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from audit.models import AuditLog 
from django.urls import reverse
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q

@login_required
def audit_log_view(request):
    logs = AuditLog.objects.filter(model_name__in=['Category', 'Brand', 'Asset']).order_by('-timestamp')
    return render(request, 'audit_log.html', {'logs': logs,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'list_audit_url': reverse('audit:logs_list'),
        })

@login_required
def logs_list(request):
    try:
        # Diccionario para traducir acciones
        action_translation = {
            "create": "Añadir",
            "delete": "Eliminar",
            "update": "Actualizar"
        }

        # Verificar si se solicitan todos los datos
        all_data = request.GET.get('all', False)

        # Consulta base
        logs = AuditLog.objects.filter(model_name__in=['Category', 'Brand', 'Asset']).order_by('-timestamp')

        # Si se piden todos los datos, devolver sin paginación
        if all_data:
            data = [
                {
                    "user": log.username,
                    "action": action_translation.get(log.action.lower(), log.action),
                    "description": log.description,
                    "timestamp": log.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                }
                for log in logs
            ]
            return JsonResponse({"data": data}, json_dumps_params={'ensure_ascii': False})

        # Parámetros de paginación de DataTables
        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))

        # Búsqueda/filtrado
        search_value = request.GET.get('search[value]', '').strip()
        if search_value:
            logs = logs.filter(
                Q(username__icontains=search_value) |
                Q(action__icontains=search_value) |
                Q(description__icontains=search_value) |
                Q(model_name__icontains=search_value)
            )

        # Conteo de registros
        total_records = AuditLog.objects.filter(model_name__in=['Category', 'Brand', 'Asset']).count()
        filtered_records = logs.count()

        # Paginación
        paginator = Paginator(logs, length)
        page_number = (start // length) + 1

        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            page_obj = paginator.page(1)

        # Preparar datos de respuesta
        data = [
            {
                "user": log.username,
                "action": action_translation.get(log.action.lower(), log.action),
                "description": log.description,
                "timestamp": log.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            }
            for log in page_obj
        ]

        # Estructura de respuesta compatible con DataTables
        response_data = {
            "draw": draw,
            "recordsTotal": total_records,
            "recordsFiltered": filtered_records,
            "data": data,
        }

        return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

    except Exception as e:
        return JsonResponse({"error": str(e), "data": []}, status=500)