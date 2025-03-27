from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.http.response import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from django.http import HttpResponseRedirect
from .forms import CreateUser, EditUser
from django.urls import reverse
from django.contrib import messages
from django.db import IntegrityError
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required, user_passes_test

def is_staff_user(user):
    return user.is_staff  # Solo permite acceso a staff

@login_required
@user_passes_test(is_staff_user, login_url='home:dashboard')
def user(request):
    user_create_form = CreateUser()
    edit_user_form = EditUser()
    return render(request, 'users.html', { 
        'user_form': user_create_form,
        'edit_user_form': edit_user_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'list_users_url': reverse('users:users_list'),
    })

@login_required
@user_passes_test(is_staff_user, login_url='home:dashboard')
def list_users(request):
    all_data = request.GET.get('all', False)

    users = User.objects.filter(is_staff=False)

    data = [{
        'id': user.id,
        'username': user.username,
        'name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'is_active': "Activo" if user.is_active else "Inactivo"
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
        'email': user.email,
        'is_active': "Activo" if user.is_active else "Inactivo"
    } for user in user_page]

    response_data = {
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': filtered_records,
        'data': data,
    }

    return JsonResponse(response_data)

@login_required
def user_create(request):
    if request.method == "POST":
        user_create_form = CreateUser(request.POST)
        if user_create_form.is_valid():
            try:
                user_create_form.save()
                messages.success(request, 'El usuario se ha guardado correctamente.')
                return HttpResponseRedirect(reverse('home:users'))
            
            except IntegrityError as e:
                if 'username' in str(e):
                    messages.error(request, 'Error: El nombre de usuario ya existe. Por favor, ingrese un nombre de usuario único.')
                else:
                    messages.error(request, 'Error: Ocurrió un problema al guardar el usuario. Por favor, inténtelo de nuevo.')
            
            except Exception as e:
                # Captura cualquier otro error inesperado
                messages.error(request, f'Error inesperado: {str(e)}')
        
        else:
            # Si el formulario no es válido, muestra errores de validación
            for field, errors in user_create_form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
    
    else:
        user_create_form = CreateUser()
    
    return render(request, 'users.html', {
        'user_form': user_create_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        })

@login_required
def user_edit(request, user_id):
    user = get_object_or_404(User, pk=user_id)

    if request.method == "POST":
        form = EditUser(request.POST, instance=user)
        if form.is_valid():
            try:
                form.save()  # Guarda los cambios, incluyendo la contraseña encriptada
                messages.success(request, 'El usuario se ha actualizado correctamente.')
            except Exception as e:
                messages.error(request, f'Error inesperado: {str(e)}')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
        return HttpResponseRedirect(reverse('users:users'))
    else:
        form = EditUser(instance=user)

    return render(request, 'users/edit_user.html', {
        'form': form,
        'user_id': user_id
    })