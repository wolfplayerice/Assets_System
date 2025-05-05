from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .forms import EditUserInfo, SecurityQuestionForm
from audit.models import AuditLog 
from users.models import Profile

@login_required
def user_info(request): 
    user = request.user  # Obtén el usuario autenticado
    EditUserForm = EditUserInfo(instance=user)  # Inicializa el formulario con los datos del usuario
    SecurityForm = SecurityQuestionForm(instance=user.profile)  # Carga el formulario con el perfil del usuario

    return render(request, 'user_info.html', {
        'first_name': user.first_name,
        'last_name': user.last_name,
        'EditUserInfo': EditUserForm,
        'SecurityQuestionForm': SecurityForm,
    })
    
@login_required
def user_edit(request, user_id):
    if request.user.id != user_id:
        return JsonResponse({'status': 'error', 'message': 'Error: No tienes permiso para editar este usuario.'})

    user = request.user
    profile = user.profile  # Obtén el perfil del usuario

    if request.method == "POST":
        # Procesa ambos formularios
        user_form = EditUserInfo(request.POST, instance=user)
        security_form = SecurityQuestionForm(request.POST, instance=profile)

        if user_form.is_valid() and security_form.is_valid():
            try:
                original_user = User.objects.get(pk=user.id)
                original_profile = Profile.objects.get(user=user)
                # Guarda los cambios en el usuario
                user_form.save()

                # Guarda los cambios en el perfil si han cambiado
                if security_form.has_changed():
                    security_form.save()

                #Auditoria
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

                return JsonResponse({'status': 'success', 'message': 'Los datos se han actualizado correctamente.'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
        else:
            # Combina los errores de ambos formularios
            errors = []
            for form in [user_form, security_form]:
                for field, error_list in form.errors.items():
                    for error in error_list:
                        errors.append(f'Error en el campo: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})
    else:
        # Carga los formularios con los datos actuales
        user_form = EditUserInfo(instance=user)
        security_form = SecurityQuestionForm(instance=profile)

    return render(request, 'user_info.html', {
        'EditUserInfo': user_form,
        'SecurityQuestionForm': security_form,
        'user_id': user_id
    })

@login_required
def get_user_data(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    return JsonResponse({
        'username': user.username,
        'password': user.password,  # Nota: No es seguro devolver contraseñas en texto plano
    })