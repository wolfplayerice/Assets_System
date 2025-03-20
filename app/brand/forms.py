from django import forms

class Create_brand(forms.Form):
    name = forms.CharField(label='Marca de los equipos', max_length=35)
