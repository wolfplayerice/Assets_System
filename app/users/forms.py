from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile

class CreateUser(UserCreationForm):
    first_name = forms.CharField(max_length=255, required=True, label='Nombre')
    last_name = forms.CharField(max_length=255, required=True, label='Apellido')
    email = forms.EmailField(max_length=255, required=True, label='Correo electrónico')
    
    # Campos de seguridad (vinculados al Profile)
    security_question = forms.ChoiceField(
        label="Pregunta de seguridad",
        choices=Profile.SECURITY_QUESTIONS,  # Asegúrate de que esté importado
        widget=forms.Select(attrs={'class': 'form-control'}),
    )
    security_answer = forms.CharField(
        label="Respuesta",
        widget=forms.TextInput(attrs={'placeholder': 'Ej: Max'}),
        strip=True,
    )

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_active = True
        user.is_staff = False
        user.is_superuser = False
        
        if commit:
            user.save()
            # Crear y guardar el Profile con los campos de seguridad
            profile = Profile.objects.create(user=user)
            profile.security_question = self.cleaned_data['security_question']
            profile.set_security_answer(self.cleaned_data['security_answer'])
        return user

class EditUser(forms.ModelForm):
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
    
class EditProfile(forms.ModelForm):  # Nuevo formulario para Profile
    security_question = forms.ChoiceField(
        choices=Profile.SECURITY_QUESTIONS,
        label="Pregunta de seguridad"
    )
    security_answer = forms.CharField(
        label="Respuesta de seguridad",
        strip=True
    )

    class Meta:
        model = Profile
        fields = ['security_question', 'security_answer']