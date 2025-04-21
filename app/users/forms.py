from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile
from django.contrib.auth.hashers import make_password

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
            print("Usuario guardado:", user)
            profile = Profile(user=user)
            profile.security_question = self.cleaned_data['security_question']
            profile.set_security_answer(self.cleaned_data['security_answer'])
            profile.save()
            print("Perfil guardado:", profile)
        return user

class EditUser(forms.ModelForm):
    # Campos del User
    username = forms.CharField(max_length=150)
    first_name = forms.CharField(max_length=150)
    last_name = forms.CharField(max_length=150)
    email = forms.EmailField()
    password = forms.CharField(
        required=False,
    )
    password2 = forms.CharField(
        required=False,
    )

    # Campos del Profile
    security_question = forms.ChoiceField(choices=Profile.SECURITY_QUESTIONS, label="Pregunta de seguridad")
    security_answer = forms.CharField(label="Respuesta de seguridad", required=False)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password']

    def __init__(self, *args, **kwargs):
        self.profile = kwargs.pop('profile', None)  # Se pasa desde la vista
        super().__init__(*args, **kwargs)

        if self.profile:
            self.fields['security_question'].initial = self.profile.security_question
            self.fields['security_answer'].initial = ''  # No se muestra la respuesta guardada

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password2 = cleaned_data.get('password2')

        # Verifica si ambas contraseñas coinciden
        # if password and password2 and password != password2:
        #     raise forms.ValidationError("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.")
        if password or password2:
             if password != password2:
                 raise forms.ValidationError("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.")

        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        if self.cleaned_data['password']:  # Solo actualiza la contraseña si se proporciona
            user.password = make_password(self.cleaned_data['password'])
        else:
             # Si no se proporciona una nueva contraseña, conserva la actual
            user.password = User.objects.get(pk=user.pk).password
        # user = super().save(commit=False)  # Obtén la instancia del usuario sin guardarla aún
        # if self.cleaned_data['password']:  # Verifica si se proporcionó una contraseña
        #     user.password = make_password(self.cleaned_data['password'])  # Encripta la contraseña
        if commit:
            user.save()  # Guarda los cambios en la base de datos

        # # Guardar perfil
        # if self.profile:
        #     self.profile.security_question = self.cleaned_data['security_question']
        #     if 'security_question' in self.changed_data:  # Solo actualizar si la pregunta cambió
        #         self.profile.set_security_answer(self.cleaned_data['security_answer'])
        #     if commit:
        #         self.profile.save()
        # # Guardar perfil
        # if self.profile:
        #     self.profile.security_question = self.cleaned_data['security_question']
        #     self.profile.set_security_answer(self.cleaned_data['security_answer'])
        #     if commit:
        #         self.profile.save()
        
        # password = self.cleaned_data.get('password')
        # if password:
        #     user.set_password(password)  # Cifra la contraseña antes de guardarla
        #     if commit:
        #         user.save()
  # Guarda los cambios en la base de datos
  
        # Guardar cambios en el perfil
        if self.profile:
            self.profile.security_question = self.cleaned_data['security_question']
            if self.cleaned_data['security_answer']:
                self.profile.set_security_answer(self.cleaned_data['security_answer'])  # Método para encriptar
            if commit:
                self.profile.save()

        return user