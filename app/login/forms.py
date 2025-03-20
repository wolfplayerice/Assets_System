from django import forms

class VerifyUser(forms.Form):
    username = forms.CharField(label='Usuario', max_length=100, widget=forms.TextInput(attrs={'class': 'form-control'}))
    password = forms.CharField(label='Contraseña', max_length=100, widget=forms.PasswordInput(attrs={'class': 'form-control'}))