from django.db import models
from brand.models import Brand
from category.models import Category
from django.contrib.auth.models import User

ACTIVE_CHOICES = [
    (True, 'Operativo'),
    (False, 'Inoperativo')
    
]

class Asset(models.Model):
    model = models.CharField(max_length=255, null=False,  verbose_name='Modelo')
    serial_number = models.CharField(max_length=255, null=False, unique=True, verbose_name='Número de serie')
    state_asset = models.CharField(max_length=255, null=False, unique=True, verbose_name='Bien del estado')
    status = models.BooleanField(default=True, null=False, choices=ACTIVE_CHOICES)
    observation = models.TextField(blank=True)
    modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    

    #Llaves foraneas
    fk_category = models.ForeignKey(Category, on_delete=models.RESTRICT)
    fk_brand = models.ForeignKey(Brand, on_delete=models.RESTRICT)

    def to_dict(self):
        return {
            "id": self.id,
            "model": self.model,
            "serial_number": self.serial_number,
            "state_asset": self.state_asset,
            "status": "Operativo" if self.status else "Inoperativo",
            "status_id": self.status,
            "fk_category": self.fk_category.name,
            "fk_category_id": self.fk_category.id,
            "fk_brand": self.fk_brand.name,
            "fk_brand_id": self.fk_brand.id,
            "observation": self.observation      
        }

    class Meta:
        verbose_name= 'Bien'
        verbose_name_plural = 'Bienes'
        db_table= 'assets'
        ordering = ['id']

