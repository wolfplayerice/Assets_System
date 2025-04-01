from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib.auth.decorators import login_required
from .forms import VerifyUser
from django.contrib.auth.models import User  # Asegúrate de importar el modelo User
from django.core.cache import cache
from django.views.decorators.cache import never_cache


def login(request):
    session_terminated = request.GET.get('session_terminated')

    if request.user.is_authenticated:
        return redirect('../home/dashboard')

    if request.method == 'GET':
        return render(request, 'login.html', {
            'VerifyUser': VerifyUser,
            'session_terminated': session_terminated 
        })
    
    elif request.method == 'POST':
        VerifyUser_Form = VerifyUser(request.POST)

        if VerifyUser_Form.is_valid():
            username = VerifyUser_Form.cleaned_data['username']
            password = VerifyUser_Form.cleaned_data['password']

            try:
                # Verifica si el usuario existe
                user = User.objects.get(username=username)
                # Verifica si la contraseña es correcta
                if not user.check_password(password):
                    # Caso: Contraseña incorrecta
                    return render(request, 'login.html', {
                        'VerifyUser': VerifyUser_Form,
                        'error_invalid': 'Algunos de los datos ingresados son incorrectos. Por favor, intente de nuevo.'
                    })
                if not user.is_active:
                    # Caso: Usuario deshabilitado
                    return render(request, 'login.html', {
                        'VerifyUser': VerifyUser_Form,
                        'error_disabled': 'No puedes ingresar porque el usuario está deshabilitado.'
                    })
            except User.DoesNotExist:
                # Si el usuario no existe, continúa con la autenticación normal
                pass

            # Autentica al usuario
            User_Verification = authenticate(request, username=username, password=password)

            if User_Verification is not None:
                auth_login(request, User_Verification)
                cache_key = f"user_{request.user.pk}_active_session"
                cache.set(cache_key, request.session.session_key, 900)
                request.session['success'] = 'Inicio de sesión exitoso.'
                return redirect('../home/dashboard')
            else:
                # Caso: Datos incorrectos
                return render(request, 'login.html', {
                    'VerifyUser': VerifyUser_Form,
                    'error_invalid': 'Algunos de los datos ingresados son incorrectos. Por favor, intente de nuevo.'
                })
        else:
            return render(request, 'login.html', {
                'VerifyUser': VerifyUser_Form
            })

@never_cache
@login_required
def log_out(request):
    cache_key = f"user_{request.user.pk}_active_session"
    cache.delete(cache_key)
    logout(request)
    response = redirect('login')
    # Headers para evitar cache
    response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response