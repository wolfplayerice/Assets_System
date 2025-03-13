from django.db import models

class Brand(models.Model):
    name= models.CharField(max_length=35, null=False, verbose_name='Marca')

    def __str__(self):
        return f"{self.id} - {self.name}"

    class Meta:
        verbose_name= 'Marca'
        verbose_name_plural = 'Marcas'
        db_table= 'Brands'
        ordering = ['id']
# Create your models here.
