from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password  # Importa para encriptar contraseñas
from users.models import Profile  # Cambia la ruta de importación al archivo correcto


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
    security_question = forms.ChoiceField(
        choices=Profile.SECURITY_QUESTIONS,
        widget=forms.Select(attrs={'class': 'form-control', 'id': 'security_question'}),
        label="Pregunta de seguridad"
    )
    security_answer = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'id': 'security_answer'}),
        label="Respuesta de seguridad",
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
        if commit:
            user.save()  # Guarda los cambios en la base de datos
        return user


class SecurityQuestionForm(forms.ModelForm):
    security_answer = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'id': 'security_answer'}),
        required=False,  # Aquí defines que no sea requerido
        label="Respuesta de seguridad"
    )

    class Meta:
        model = Profile
        fields = ['security_question', 'security_answer']
        widgets = {
            'security_question': forms.Select(attrs={'class': 'form-control', 'id': 'security_question'}),
        }
        labels = {
            'security_question': 'Pregunta de seguridad',
        }
        help_texts = {
            'security_answer': 'Este campo solo será requerido si cambias la pregunta de seguridad.',
        }
    def clean(self):
        cleaned_data = super().clean()
        new_question = cleaned_data.get('security_question')
        answer = cleaned_data.get('security_answer')


        return cleaned_data

    def save(self, commit=True):
        profile = super().save(commit=False)

        answer = self.cleaned_data.get('security_answer')
        if answer:
            profile.set_security_answer(answer)

        if commit:
            profile.save()

        return profile