from django.db import models
from django.contrib.auth.models import User

class Brand(models.Model):
    name= models.CharField(max_length=35, null=False, verbose_name='Marca')
    modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id} - {self.name}"

    class Meta:
        verbose_name= 'Marca'
        verbose_name_plural = 'Marcas'
        db_table= 'Brands'
        ordering = ['id']
# Create your models here.
