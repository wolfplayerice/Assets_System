from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .forms import EditUserInfo

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
        messages.error(request, "No tienes permiso para editar este usuario.")
        return HttpResponseRedirect(reverse('user_info:user_info'))

    user = request.user  # Obtén el usuario autenticado
    if request.method == "POST":
        form = EditUserInfo(request.POST, instance=user)  # Inicializa el formulario con los datos enviados
        if form.is_valid():
            try:
                form.save()  # Guarda los cambios en la base de datos
                # messages.success(request, 'La información del usuario se ha actualizado correctamente.')
            except Exception as e:
                messages.error(request, f'Error inesperado: {str(e)}')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
        return HttpResponseRedirect(reverse('user_info:user_info'))  # Redirige a la vista principal
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