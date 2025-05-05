from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.http.response import JsonResponse
from django.core.paginator import Paginator
from .forms import CreateUser, EditUser
from django.urls import reverse
from django.db import IntegrityError
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.csrf import csrf_exempt
from audit.models import AuditLog 
from django.db.models import Q
from .models import Profile

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
    try:
        all_data = request.GET.get('all', False)

        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '').strip()

        order_column_index = request.GET.get('order[0][column]', '0')
        order_direction = request.GET.get('order[0][dir]', 'asc')

        column_map = {
            '0': 'id',
            '1': 'username',
            '2': 'first_name',
            '3': 'last_name',
            '4': 'email',
            '5': 'is_active',
        }

        order_field = column_map.get(order_column_index, 'id')
        if order_direction == 'desc':
            order_field = f'-{order_field}'

        # users = User.objects.filter(is_staff=False).order_by(order_field)
        users = User.objects.filter(is_staff=False).select_related('profile').order_by(order_field)

        if search_value:
            users = users.filter(
                Q(username__icontains=search_value) |
                Q(first_name__icontains=search_value) |
                Q(last_name__icontains=search_value) |
                Q(email__icontains=search_value) |
                Q(id__icontains=search_value)
            )

        if all_data:
            data = [{
                'id': user.id,
                'username': user.username,
                'name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'is_active': user.is_active,
                'security_question': user.profile.security_question if hasattr(user, 'profile') else None,
            } for user in users]
            
            response_data = {
                'users': data,
            }
            return JsonResponse(response_data)

        total_records = User.objects.filter(is_staff=False).count()
        filtered_records = users.count()

        paginator = Paginator(users, length)
        page_number = (start // length) + 1

        try:
            user_page = paginator.page(page_number)
        except Exception:
            user_page = paginator.page(1)

        data = [{
            'id': user.id,
            'username': user.username,
            'name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_active': user.is_active,
            'security_question': user.profile.security_question if hasattr(user, 'profile') else None,
        } for user in user_page]

        response_data = {
            'draw': draw,
            'recordsTotal': total_records,
            'recordsFiltered': filtered_records,
            'data': data,
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def user_create(request):
    if request.method == "POST":
        user_create_form = CreateUser(request.POST)

        if user_create_form.is_valid():
            try:
                user = user_create_form.save()  # Aquí ya se guarda el perfil también (desde el form)

                # Auditoría
                AuditLog.objects.create(
                    user=request.user,
                    action="create",
                    model_name="User",
                    object_id=user.id,
                    description=f"Creación de usuario {user.username} (ID: {user.id})"
                )

                return JsonResponse({'status': 'success', 'message': 'Usuario creado exitosamente.'})

            except IntegrityError as e:
                if 'username' in str(e):
                    return JsonResponse({'status': 'error', 'message': 'El nombre de usuario ya existe.'})
                else:
                    return JsonResponse({'status': 'error', 'message': 'Error al guardar el usuario.'})

            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})

        else:
            # Manejo de errores del formulario
            errors = []
            for field, error_list in user_create_form.errors.items():
                for error in error_list:
                    errors.append(f'Error en el campo: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})

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
    profile = user.profile

    if request.method == "POST":
        form = EditUser(request.POST, instance=user, profile=profile)
        if form.is_valid():
            try:
                original_user = User.objects.get(pk=user.id)
                original_profile = Profile.objects.get(user=user)

                form.save()

                # Auditoría
                changes = []
                field_map = {
                    'username': 'Usuario',
                    'first_name': 'Nombre',
                    'last_name': 'Apellido',
                    'email': 'Correo electrónico',
                    'security_question': 'Pregunta de seguridad',
                    'security_answer': 'Respuesta de seguridad'
                }

                # Comparar User
                for field in ['username', 'first_name', 'last_name', 'email']:
                    old = getattr(original_user, field)
                    new = getattr(user, field)
                    if str(old) != str(new):
                        changes.append(f"{field_map[field]}: '{old}' cambió a '{new}'")

                # Comparar Profile
                if original_profile.security_question != profile.security_question:
                    changes.append(f"{field_map['security_question']}: '{original_profile.get_security_question_display()}' cambió a '{profile.get_security_question_display()}'")

                if not profile.check_security_answer(original_profile.security_answer):
                    changes.append(f"{field_map['security_answer']} fue actualizada")

                AuditLog.objects.create(
                    user=request.user,
                    action="update",
                    model_name="User",
                    object_id=user.id,
                    description="; ".join(changes) or "Edición sin cambios."
                )
                AuditLog.objects.create(
                    user=request.user,
                    action="update",
                    model_name="Profile",
                    object_id=user.id,
                    description="; ".join(changes) or "Edición sin cambios."
                )

                return JsonResponse({'status': 'success', 'message': 'Usuario actualizado correctamente.'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
        else:
            errors = []
            for field, error_list in form.errors.items():
                for error in error_list:
                    errors.append(f'Error en el campo: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})
    else:
        form = EditUser(instance=user, profile=profile)

    return render(request, 'users.html', {
        'form': form,
        'user_id': user_id,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

    
@login_required
@csrf_exempt
def disable_user(request, user_id):
    if request.method == "POST":
        user = get_object_or_404(User, pk=user_id)
        if not user.is_staff:  # Asegúrate de que no sea un administrador
            user.is_active = False
            user.save()
            AuditLog.objects.create(
                user=request.user,
                action="update",
                model_name="User",
                object_id=user.id,
                description=f"Inhabilitación del usuario {user.username} (ID: {user.id})"
            )
            return JsonResponse({
                'message': 'El usuario ha sido deshabilitado correctamente.',
                'is_active': "Inactivo"
            })
        return JsonResponse({'error': 'No puedes deshabilitar a un administrador.'}, status=400)
    return JsonResponse({'error': 'Método no permitido.'}, status=405)

@login_required
@csrf_exempt
def enable_user(request, user_id):
    if request.method == "POST":
        user = get_object_or_404(User, pk=user_id)
        if not user.is_staff:  # Asegúrate de que no sea un administrador
            user.is_active = True
            user.save()
            AuditLog.objects.create(
                user=request.user,
                action="update",
                model_name="User",
                object_id=user.id,
                description=f"Habilitación del usuario {user.username} (ID: {user.id})"
            )
            return JsonResponse({
                'message': 'El usuario ha sido habilitado correctamente.',
                'is_active': "Activo"
            })
        return JsonResponse({'error': 'No puedes habilitar a un administrador.'}, status=400)
    return JsonResponse({'error': 'Método no permitido.'}, status=405)