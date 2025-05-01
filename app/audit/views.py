from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from audit.models import AuditLog 
from django.urls import reverse
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from datetime import datetime, timedelta

@login_required
def audit_log_view(request):
    logs = AuditLog.objects.filter(model_name__in=['Category', 'Brand', 'Asset', 'User']).order_by('-timestamp')
    return render(request, 'audit_log.html', {'logs': logs,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'list_audit_url': reverse('audit:logs_list'),
        })

@login_required
def logs_list(request):
    try:
        action_translation = {
            "create": "Añadir",
            "delete": "Eliminar",
            "update": "Actualizar"
        }

        # Parámetros de DataTables
        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '').strip()
        
        # Parámetros para exportación PDF
        all_data = request.GET.get('all', 'false').lower() == 'true'
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        # Parámetros de ordenamiento
        order_column_index = request.GET.get('order[0][column]', '0')
        order_direction = request.GET.get('order[0][dir]', 'desc')  # Por defecto orden descendente

        column_map = {
            '0': 'username',  
            '1': 'action',   
            '2': 'description',     
            '3': 'timestamp' 
        }

        order_field = column_map.get(order_column_index, 'timestamp')
        if order_direction == 'desc':
            order_field = f'-{order_field}'

        # Consulta base
        logs = AuditLog.objects.filter(model_name__in=['Category', 'Brand', 'Asset', 'User'])

        # Filtrar por rango de fechas si se proporcionan ambas
        if start_date and end_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                # Ajustar end_date para incluir todo el día
                end_date = end_date + timedelta(days=1)
                logs = logs.filter(timestamp__range=[start_date, end_date])
            except ValueError:
                pass  # Si hay error en el formato de fecha, ignorar el filtro

        # Búsqueda
        reverse_action_translation = {v.lower(): k for k, v in action_translation.items()}
        search_value_action = reverse_action_translation.get(search_value.lower(), search_value)
        if search_value:
            logs = logs.filter(
                Q(username__icontains=search_value) |
                Q(action__icontains=search_value_action) |
                Q(description__icontains=search_value) |
                Q(timestamp__icontains=search_value)
            )

        # Ordenamiento
        logs = logs.order_by(order_field)

        # Exportación completa para PDF
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

        # Paginación para DataTables
        total_records = AuditLog.objects.filter(model_name__in=['Category', 'Brand', 'Asset', 'User']).count()
        filtered_records = logs.count()

        paginator = Paginator(logs, length)
        page_number = (start // length) + 1

        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            page_obj = paginator.page(1)

        data = [
            {
                "user": log.username,
                "action": action_translation.get(log.action.lower(), log.action),
                "description": log.description,
                "timestamp": log.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            }
            for log in page_obj
        ]

        response_data = {
            "draw": draw,
            "recordsTotal": total_records,
            "recordsFiltered": filtered_records,
            "data": data,
        }

        return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

    except Exception as e:
        return JsonResponse({"error": str(e), "data": []}, status=500)