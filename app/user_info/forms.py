from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password  # Importa para encriptar contraseñas


class EditUserInfo(forms.ModelForm):
    password = forms.CharField(
         widget=forms.PasswordInput(attrs={'class': 'form-control', 'id': 'edit_password'}),
         label="Contraseña",
         required=False  # No obligatorio
     )
    
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'id': 'edit_password2'}),
        label="Confirmar contraseña",
        required=False
    )

    class Meta: 
        model = User
        fields = ['username', 'first_name', 'last_name', 'password']  # Asegúrate de incluir estos campos
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit_username'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit_first_name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit_last_name'}),
            'password': forms.PasswordInput(attrs={'class': 'form-control', 'id': 'edit_password'}),
        }
        help_texts = {
            'username': None,  # Elimina el texto de ayuda predeterminado
        }

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
        return user