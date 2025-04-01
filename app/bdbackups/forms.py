from django import forms
from .models import DatabaseBackup

class BackupForm(forms.ModelForm):
    class Meta:
        model = DatabaseBackup
        fields = ['name', 'description']
        
class RestoreForm(forms.Form):
    backup_file = forms.ModelChoiceField(queryset=DatabaseBackup.objects.all(), label="Seleccionar backup")
    confirm = forms.BooleanField(label="Confirmar restauración", help_text="Esta acción sobrescribirá la base de datos actual")