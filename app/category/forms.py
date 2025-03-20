from django import forms

class Create_category(forms.Form):
    name = forms.CharField(label='Nombre de la categoria', max_length=35)