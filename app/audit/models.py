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
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField()
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.model_name} - {self.timestamp}"