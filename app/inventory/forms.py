from django import forms
from .models import ACTIVE_CHOICES, Category, Brand

class AssetCreate(forms.Form):
    model = forms.CharField(label="Modelo del equipo", max_length=255)
    serial_number = forms.CharField(label="Número de serie", max_length=255)
    prefix = forms.ChoiceField(choices=[('BBVA-', 'BBVA'), ('BE-', 'BE')], label="Prefijo")
    state_asset = forms.CharField(label="BBVA/BE", max_length=255)
    fk_category = forms.ModelChoiceField(queryset=Category.objects.all(), label="Categoría",)
    fk_brand = forms.ModelChoiceField(queryset=Brand.objects.all(), label="Marca",)
    status = forms.ChoiceField(label='Estado del bien',choices=ACTIVE_CHOICES, widget=forms.Select(attrs={'id': 'status_select'}))
    observation = forms.CharField(widget=forms.Textarea(attrs={'id': 'id_observation'}), label="Observaciones", required=False)