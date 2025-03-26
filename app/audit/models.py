from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('Create', 'Creación'),
        ('Update', 'Edición'),
        ('Delete', 'Eliminación'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    username = models.CharField(max_length=255, blank=True, null=True)
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField()
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)


    def save(self, *args, **kwargs):
        if self.user and not self.username:  # Solo llenar si no está ya guardado
            self.username = self.user.username
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} - {self.action} - {self.model_name} - {self.timestamp}"