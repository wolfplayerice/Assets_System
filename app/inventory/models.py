from django.db import models
from django.forms import ModelForm
from brand.models import Brand
from category.models import Category


# Create your models here.

ACTIVE_CHOICES = [
    (True, 'Operativo'),
    (False, 'Inoperativo')
    
]

class Asset(models.Model):
    model = models.CharField(max_length=255, null=False,  verbose_name='Modelo')
    serial_number = models.CharField(max_length=255, null=False, unique=True, verbose_name='Número de serie')
    state_asset = models.CharField(max_length=255, null=False, verbose_name='Bien del estado')
    status = models.BooleanField(default=True, null=False, choices=ACTIVE_CHOICES)
    observation = models.TextField(blank=True)

    #Llaves foraneas
    fk_category = models.ForeignKey(Category, on_delete=models.CASCADE)
    fk_brand = models.ForeignKey(Brand, on_delete=models.CASCADE)

    def to_dict(self):
        return {
            "model": self.model,
            "serial_number": self.serial_number,
            "state_asset": self.state_asset,
            "status": "Operativo" if self.status else "Inoperativo",
            "fk_category": self.fk_category.name,  
            "fk_brand": self.fk_brand.name,
            "observation": self.observation      
        }

    class Meta:
        verbose_name= 'Bien'
        verbose_name_plural = 'Bienes'
        db_table= 'Assets'
        ordering = ['id']

class AssetForm(ModelForm):
    class Meta:
        model = Asset
        fields = ["model"]
