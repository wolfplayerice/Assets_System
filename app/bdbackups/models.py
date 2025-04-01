from django.db import models
from django.core.files.storage import FileSystemStorage
import os

def backup_upload_path(instance, filename):
    return f'backups/{filename}'

class DatabaseBackup(models.Model):
    name = models.CharField(max_length=255)
    backup_file = models.FileField(upload_to=backup_upload_path)
    created_at = models.DateTimeField(auto_now_add=True)
    size = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.backup_file:
            self.size = self.get_file_size()
            super().save(update_fields=['size'])
    
    def get_file_size(self):
        try:
            size_bytes = self.backup_file.size
            if size_bytes < 1024:
                return f"{size_bytes} B"
            elif size_bytes < 1024*1024:
                return f"{size_bytes/1024:.2f} KB"
            else:
                return f"{size_bytes/(1024*1024):.2f} MB"
        except:
            return "0 B"
    
    def __str__(self):
        return self.name