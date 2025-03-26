from django import forms
from .models import Category

class Create_category(forms.Form):
    name = forms.CharField(label='Nombre de la categoria', max_length=35)

class Edit_category(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-cat-name'})
        }