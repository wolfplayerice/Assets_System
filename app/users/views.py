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
from django.views.decorators.csrf import csrf_exempt
from audit.models import AuditLog 
from django.db.models import Q

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

        users = User.objects.filter(is_staff=False).order_by(order_field)

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
                user=user_create_form.save()
                AuditLog.objects.create(
                    user=request.user,
                    action="create",
                    model_name="User",
                    object_id=user.id,
                    description=f"Creación de usuario {user.username} (ID: {user.id})"
                )
                return JsonResponse({'status': 'success', 'message': 'Usuario creado exitosamente.'})
                # messages.success(request, 'El usuario se ha guardado correctamente.')
                # return HttpResponseRedirect(reverse('home:users'))
            
            except IntegrityError as e:
                if 'username' in str(e):
                    return JsonResponse({'status': 'error', 'message': 'Error: El nombre de usuario ya existe. Por favor, ingrese un nombre de usuario único.'})
                    #messages.error(request, 'Error: El nombre de usuario ya existe. Por favor, ingrese un nombre de usuario único.')
                else:
                    return JsonResponse({'status': 'error', 'message': 'Error: Ocurrió un problema al guardar el usuario. Por favor, inténtelo de nuevo.'})
                    #messages.error(request, 'Error: Ocurrió un problema al guardar el usuario. Por favor, inténtelo de nuevo.')
            
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
                # Captura cualquier otro error inesperado
                #messages.error(request, f'Error inesperado: {str(e)}')
        
        else:
            errors = []
            for field, error_list in user_create_form.errors.items():
                for error in error_list:
                    errors.append(f'Error en el campo {field}: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})  
            # Si el formulario no es válido, muestra errores de validación
            # for field, errors in user_create_form.errors.items():
            #     for error in errors:
            #         messages.error(request, f'Error en el campo {field}: {error}')
    
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
    
    # Diccionario de traducción de nombres de campos
    FIELD_NAMES = {
        'username': 'Usuario',
        'first_name': 'Nombre',
        'last_name': 'Apellido',
        'email': 'Correo electrónico',
        'is_active': 'Estado'
    }
    if request.method == "POST":
        form = EditUser(request.POST, instance=user)
        if form.is_valid():
            try:
                # 1. Crear una copia COMPLETA del objeto ANTES de guardar
                original_user = User.objects.get(pk=user.id)
                old_values = {
                    'username': original_user.username,
                    'first_name': original_user.first_name,
                    'last_name': original_user.last_name,
                    'email': original_user.email,
                    'is_active': original_user.is_active
                }
                
                # 2. Guardar el formulario
                form.save()
                
                # 3. Obtener el objeto ACTUALIZADO directamente desde el formulario
                updated_user = form.instance
                new_values = {
                    'username': updated_user.username,
                    'first_name': updated_user.first_name,
                    'last_name': updated_user.last_name,
                    'email': updated_user.email,
                    'is_active': updated_user.is_active
                }

                
                # 5. Detectar cambios REALES
                changes = []
                for field in old_values:
                    old_val = old_values[field]
                    new_val = new_values[field]
                    
                    if str(old_val) != str(new_val):  # Comparación como strings
                        if field == 'is_active':
                            action = "Habilitación" if new_val else "Inhabilitación"
                            changes.append(f"{action} del usuario")
                        else:
                            field_name = FIELD_NAMES.get(field, field)
                            changes.append(f"{field_name}: '{old_val}' cambio a '{new_val}'")
                
                # 6. Crear mensaje de auditoría
                if changes:
                    changes_str = "; ".join(changes)
                    audit_message = f"Actualización de usuario {updated_user.username} (ID: {updated_user.id}): {changes_str}"
                else:
                    audit_message = f"Usuario {updated_user.username} (ID: {updated_user.id}) editado sin cambios significativos."
                
                # 7. Registrar auditoría
                AuditLog.objects.create(
                    user=request.user,
                    action="update",
                    model_name="User",
                    object_id=updated_user.id,
                    description=audit_message
                )
                return JsonResponse({'status': 'success', 'message': 'El usuario se ha actualizado correctamente.'})
                #messages.success(request, 'El usuario se ha actualizado correctamente.')
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
                #messages.error(request, f'Error inesperado: {str(e)}')
        else:
            errors = []
            for field, error_list in form.errors.items():
                for error in error_list:
                    errors.append(f'Error en el campo {field}: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})
        #     for field, errors in form.errors.items():
        #         for error in errors:
        #             messages.error(request, f'Error en el campo {field}: {error}')
        # return HttpResponseRedirect(reverse('users:users'))
    else:
        form = EditUser(instance=user)

    return render(request, 'users/edit_user.html', {
        'form': form,
        'user_id': user_id
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