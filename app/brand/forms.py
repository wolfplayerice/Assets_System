from django import forms

class BrandCreate(forms.Form):
    name = forms.CharField(label="Marca de los equipos", max_length=35)
