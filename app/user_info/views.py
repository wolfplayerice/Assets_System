from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .forms import EditUserInfo, SecurityQuestionForm

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
                # Guarda los cambios en el usuario
                user_form.save()

                # Guarda los cambios en el perfil si han cambiado
                if security_form.has_changed():
                    security_form.save()

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