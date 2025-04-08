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
            profile = user.profile
            profile.security_question = self.cleaned_data['security_question']
            profile.set_security_answer(self.cleaned_data['security_answer'])
            profile.save()
        return user

class EditUser(forms.ModelForm):
    # Campos del User
    username = forms.CharField(max_length=150)
    first_name = forms.CharField(max_length=150)
    last_name = forms.CharField(max_length=150)
    email = forms.EmailField()

    # Campos del Profile
    security_question = forms.ChoiceField(choices=Profile.SECURITY_QUESTIONS, label="Pregunta de seguridad")
    security_answer = forms.CharField(label="Respuesta de seguridad", strip=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']

    def __init__(self, *args, **kwargs):
        self.profile = kwargs.pop('profile', None)  # Se pasa desde la vista
        super().__init__(*args, **kwargs)

        if self.profile:
            self.fields['security_question'].initial = self.profile.security_question
            self.fields['security_answer'].initial = ''  # No se muestra la respuesta guardada

    def save(self, commit=True):
        user = super().save(commit=commit)

        # Guardar perfil
        if self.profile:
            self.profile.security_question = self.cleaned_data['security_question']
            self.profile.set_security_answer(self.cleaned_data['security_answer'])
            if commit:
                self.profile.save()

        return user