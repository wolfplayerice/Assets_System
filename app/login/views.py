from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib.auth.decorators import login_required
from .forms import VerifyUser
from django.contrib.auth.models import User  # Asegúrate de importar el modelo User
def login(request):
    if request.user.is_authenticated:
        return redirect('../home/dashboard')

    if request.method == 'GET':
        return render(request, 'login.html', {
            'VerifyUser': VerifyUser
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

@login_required            
def log_out(request):
    logout(request)
    return redirect('login')