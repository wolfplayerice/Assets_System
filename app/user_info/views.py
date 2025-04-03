from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .forms import EditUserInfo
from audit.models import AuditLog 

@login_required
def user_info(request): 
    EditUserForm = EditUserInfo()
    return render(request, 'user_info.html',{
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'EditUserInfo': EditUserForm
        })
    
@login_required
def user_info(request): 
    user = request.user  # Obtén el usuario autenticado
    EditUserForm = EditUserInfo(instance=user)  # Inicializa el formulario con los datos del usuario
    return render(request, 'user_info.html', {
        'first_name': user.first_name,
        'last_name': user.last_name,
        'EditUserInfo': EditUserForm
    })
    
@login_required
def user_edit(request, user_id):
    # Asegúrate de que el usuario autenticado está editando su propia información
    if request.user.id != user_id:
        return JsonResponse({'status': 'error', 'message': 'Error: No tienes permiso para editar este usuario.'})
        # messages.error(request, "No tienes permiso para editar este usuario.")
        # return HttpResponseRedirect(reverse('user_info:user_info'))

    user = request.user  # Obtén el usuario autenticado
    FIELD_NAMES = {
        'username': 'Usuario',
        'first_name': 'Nombre',
        'last_name': 'Apellido',
        'email': 'Correo electrónico',
        'is_active': 'Estado'
    }
    if request.method == "POST":
        form = EditUserInfo(request.POST, instance=user)  # Inicializa el formulario con los datos enviados
        if form.is_valid():
            try:
                original_user = User.objects.get(pk=user_id)
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
                #messages.success(request, 'La información del usuario se ha actualizado correctamente.')
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
        # return HttpResponseRedirect(reverse('user_info:user_info'))  # Redirige a la vista principal
    else:
        form = EditUserInfo(instance=user)  # Carga el formulario con los datos actuales del usuario
    return render(request, 'user_info.html', {
        'EditUserInfo': form,
        'user_id': user_id
    })
@login_required
def get_user_data(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    return JsonResponse({
        'username': user.username,
        'password': user.password,  # Nota: No es seguro devolver contraseñas en texto plano
    })