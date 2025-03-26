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

class EditUser(forms.ModelForm):
    password = forms.CharField(
        required=False,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'id': 'edit-user-password'}),
        label="Nueva contraseña"
    )
    password2 = forms.CharField(
        required=False,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'id': 'edit-user-password2'}),
        label="Confirmar nueva contraseña"
    )
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-user-username'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-user-name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-user-last_name'}),
            'email': forms.TextInput(attrs={'class': 'form-email', 'id': 'edit-user-email'})
        }
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password2 = cleaned_data.get("password2")

        if password and password != password2:
            raise forms.ValidationError("Las contraseñas no coinciden.")
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get("password")
        if password:
            user.set_password(password)  # Encripta la contraseña
        if commit:
            user.save()
        return user