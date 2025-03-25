from django import forms
from .models import ACTIVE_CHOICES, Category, Brand, Asset

class AssetCreate(forms.Form):
    model = forms.CharField(label="Modelo del equipo", max_length=255)
    serial_number = forms.CharField(label="Número de serie", max_length=255)
    prefix = forms.ChoiceField(choices=[('BBVA-', 'BBVA'), ('BE-', 'BE')], label="Prefijo")
    state_asset = forms.CharField(label="BBVA/BE", max_length=255)
    fk_category = forms.ModelChoiceField(queryset=Category.objects.all(), label="Categoría",)
    fk_brand = forms.ModelChoiceField(queryset=Brand.objects.all(), label="Marca",)
    status = forms.ChoiceField(label='Estado del bien',choices=ACTIVE_CHOICES, widget=forms.Select(attrs={'id': 'status_select'}))
    observation = forms.CharField(widget=forms.Textarea(attrs={'id': 'id_observation'}), label="Observaciones", required=False)

class AssetEdit(forms.ModelForm):
    class Meta:
        model = Asset
        fields = ['fk_brand', 'model', 'fk_category', 'serial_number', 'state_asset', 'status', 'observation']
        widgets = {
            # 'fk_brand': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-brand'}),
            'model': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-model'}),
            # 'fk_category': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-category'}),
            'serial_number': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-serial'}),
            'state_asset': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-state'}),
            # 'status': forms.TextInput(attrs={'class': 'form-control', 'id': 'edit-status'}),
            'observation': forms.Textarea(attrs={'class': 'form-control', 'id': 'edit-observation'}),
        }