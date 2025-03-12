from django.db import models

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=35, null=False, verbose_name='Categoria')

    def __str__(self):
        return f"{self.id} - {self.name}"
    
    class Meta:
        verbose_name= 'Categoria'
        verbose_name_plural = 'Categorias'
        db_table= 'Categories'
        ordering = ['id']

class Brand(models.Model):
    name= models.CharField(max_length=35, null=False, verbose_name='Marca')

    def __str__(self):
        return f"{self.id} - {self.name}"

    class Meta:
        verbose_name= 'Marca'
        verbose_name_plural = 'Marcas'
        db_table= 'Brands'
        ordering = ['id']

class Asset(models.Model):
    model = models.CharField(max_length=255, null=False,  verbose_name='Modelo')
    serial_number = models.CharField(max_length=255, null=False, unique=True, verbose_name='Número de serie')
    state_asset = models.CharField(max_length=255, null=False, verbose_name='Bien del estado')
    status = models.BooleanField(default=False)

    #Llaves foraneas
    fk_category = models.ForeignKey(Category, on_delete=models.CASCADE)
    fk_brand = models.ForeignKey(Brand, on_delete=models.CASCADE)

    def to_dict(self):
        return {
            "model": self.model,
            "serial_number": self.serial_number,
            "state_asset": self.state_asset,
            "status": self.status,
            "fk_category": self.fk_category.name,  
            "fk_brand": self.fk_brand.name,        
        }

    class Meta:
        verbose_name= 'Bien'
        verbose_name_plural = 'Bienes'
        db_table= 'Assets'
        ordering = ['id']