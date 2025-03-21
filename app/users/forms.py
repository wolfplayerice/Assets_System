from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class CreateUser(UserCreationForm):
    first_name = forms.CharField(max_length=255, required=True, label='Nombre')
    last_name = forms.CharField(max_length=255, required=True, label='Apellido')
    email = forms.EmailField(max_length=255, required=True, label='Correo electrónico')

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        # Establecer valores predeterminados para campos ocultos
        user.is_active = True  # Por ejemplo, activar el usuario por defecto
        user.is_staff = False  # No es staff por defecto
        user.is_superuser = False  # No es superusuario por defecto
        if commit:
            user.save()
        return user
