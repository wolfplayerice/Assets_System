from django import forms
from django.contrib.auth.models import User
from users.models import Profile

class VerifyUser(forms.Form):
    username = forms.CharField(label='Usuario', max_length=100, widget=forms.TextInput(attrs={'class': 'form-control'}))
    password = forms.CharField(label='Contraseña', max_length=100, widget=forms.PasswordInput(attrs={'class': 'form-control'}))

class SecurityQuestionForm(forms.Form):
    username = forms.CharField(label="Usuario", max_length=150)
    security_answer = forms.CharField(label="Respuesta de seguridad", widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get("username")
        answer = cleaned_data.get("security_answer")

        if username:
            try:
                user = User.objects.get(username=username)
                profile = user.profile
                if not profile.check_security_answer(answer):
                    raise forms.ValidationError("La respuesta de seguridad es incorrecta.")
            except User.DoesNotExist:
                raise forms.ValidationError("El usuario no existe.")
        return cleaned_data