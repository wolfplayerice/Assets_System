from django.shortcuts import render
from django.contrib.auth.models import User
from django.http.response import JsonResponse, HttpResponse
from django.core.paginator import Paginator

# Create your views here.

def user(request):
    return render(request, 'users.html', { 
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

def list_users(request):
    all_data = request.GET.get('all', False)

    users = User.objects.all()

    data = [{
        'id': user.id,
        'username': user.username,
        'name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active
    } for user in users]

    if all_data:
        response_data = {
            'users': data,
        }
        return JsonResponse(response_data)

    try:
        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))  # Número de registros por página
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Invalid parameters'}, status=400)

    search_value = request.GET.get('search[value]', None)

    if search_value:
        users = users.filter(username__icontains=search_value)

    total_records = users.count()
    filtered_records = users.count()

    paginator = Paginator(users, length)
    page = (start // length) + 1

    try:
        user_page = paginator.page(page)
    except Exception:
        user_page = paginator.page(1)

    data = [{
        'id': user.id,
        'username': user.username,
        'name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active
    } for user in user_page]

    response_data = {
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': filtered_records,
        'data': data,
    }

    return JsonResponse(response_data)