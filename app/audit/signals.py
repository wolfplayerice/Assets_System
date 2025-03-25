from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import AuditLog

@receiver(post_save)
def log_create_update(sender, instance, created, **kwargs):
    if sender.__name__ == "AuditLog":  # Evitar registrar cambios en el propio modelo de auditoría
        return

    user = getattr(instance, 'modified_by', None)
    action = 'Create' if created else 'Update'

    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=sender.__name__,
        object_id=instance.pk,
        description=f"{action.capitalize()} de {sender.__name__} (ID: {instance.pk})"
    )

@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender.__name__ == "AuditLog":
        return

    user = getattr(instance, 'modified_by', None)

    AuditLog.objects.create(
        user=user,
        action='Delete',
        model_name=sender.__name__,
        object_id=instance.pk,
        description=f"Eliminación de {sender.__name__} (ID: {instance.pk})"
    )