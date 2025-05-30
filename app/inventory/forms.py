from django import forms
from .models import ACTIVE_CHOICES, Category, Brand, Asset

class AssetCreate(forms.Form):
    model = forms.CharField(label="Modelo del equipo", max_length=255)
    serial_number = forms.CharField(label="Número de serie", max_length=255)
    prefix = forms.ChoiceField(choices=[('BBVA-', 'BBVA'), ('BE-', 'BE'), ('ILE-', 'ILE')], label="Prefijo")
    state_asset = forms.CharField(label="BBVA/BE", max_length=255)
    fk_category = forms.ModelChoiceField(
        queryset=Category.objects.all(),
        label="",  # Eliminar el label
        widget=forms.Select(attrs={
            'class': 'form-select', 
            'id': 'fk_category_select', 
            'placeholder': 'Seleccione una categoría'
        })
    )
    fk_brand = forms.ModelChoiceField(
        queryset=Brand.objects.all(),
        label="",  # Eliminar el label
        widget=forms.Select(attrs={
            'class': 'form-select', 
            'id': 'fk_brand_select', 
            'placeholder': 'Seleccione una marca'
        })
    )
    status = forms.ChoiceField(label='Estado del bien',choices=ACTIVE_CHOICES, widget=forms.Select(attrs={'id': 'status_select'}))
    observation = forms.CharField(widget=forms.Textarea(attrs={'id': 'id_observation'}), label="Observaciones", required=False)

class AssetEdit(forms.ModelForm):
    status = forms.ChoiceField(
        choices=[
            ('True', 'Operativo'),
            ('False', 'Inoperativo')
        ],
        widget=forms.Select(attrs={
            'class': 'form-control',
            'name': 'status'
        })
    )
    
    prefix = forms.ChoiceField(
        choices=[('BBVA-', 'BBVA'), ('BE-', 'BE'), ('ILE-', 'ILE')],
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'id_prefix'
        }),
        label="Prefijo"
    )

    class Meta:
        model = Asset
        fields = ['fk_brand', 'model', 'fk_category', 'serial_number', 'state_asset', 'status', 'observation']
        widgets = {
            'fk_brand': forms.Select(attrs={
                'class': 'form-control',
                'id': 'id_fk_brand'
            }),
            'model': forms.TextInput(attrs={
                'class': 'form-control',
                'id': 'id_model'
            }),
            'fk_category': forms.Select(attrs={
                'class': 'form-control',
                'id': 'id_fk_category'
            }),
            'serial_number': forms.TextInput(attrs={
                'class': 'form-control',
                'id': 'id_serial_number'
            }),
            'state_asset': forms.TextInput(attrs={
                'class': 'form-control',
                'id': 'id_state_asset',
                'placeholder': 'Solo números'
            }),
            'status': forms.Select(attrs={
                'class': 'form-control',
                'id': 'id_status'
            }),
            'observation': forms.Textarea(attrs={
                'class': 'form-control',
                'id': 'id_observation',
                'rows': 3
            }),
        }