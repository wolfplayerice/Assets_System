from django import forms
from .models import Brand

class Create_brand(forms.Form):
    name = forms.CharField(label='Marca de los equipos', max_length=35)
    
class Edit_brand(forms.ModelForm):
    class Meta:
        model = Brand
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-bra-name'})
        }