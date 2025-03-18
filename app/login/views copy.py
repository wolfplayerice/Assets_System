from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from .forms import VerifyUser

def login(request):

    if request.method == 'GET':

        return render(request, 'login.html', {

            'VerifyUser': VerifyUser

        })
    
    elif request.method == 'POST':

        VerifyUser_Form = VerifyUser(request.POST)

        if VerifyUser_Form.is_valid():

            username =VerifyUser_Form.cleaned_data['username']
            password = VerifyUser_Form.cleaned_data['password']

            User_Verification = authenticate(request, username=username, password=password)

            if User_Verification is not None:

                auth_login(request, User_Verification)
                return render(request, '../home/dashboard.html', {

                    'success': 'Inicio de sesión exitoso.',
                    'VerifyUser': VerifyUser_Form

                })
            
            else:

                return render(request, 'login.html', {

                    'error': 'Algunos de los datos ingresados son incorrectos. Por favor, intente de nuevo.',
                    'VerifyUser': VerifyUser_Form

                })
    
        else:

            return render(request, 'login.html', {

                'VerifyUser': VerifyUser_Form
            })