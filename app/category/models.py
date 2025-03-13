from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=35, null=False, verbose_name='Categoria')

    def __str__(self):
        return f"{self.id} - {self.name}"
    
    class Meta:
        verbose_name= 'Categoria'
        verbose_name_plural = 'Categorias'
        db_table= 'Categories'
        ordering = ['id']
# Create your models here.
