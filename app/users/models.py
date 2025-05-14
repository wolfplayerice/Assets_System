from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password, check_password, is_password_usable  # Para hashear respuestas

class Profile(models.Model):
    # Preguntas predeterminadas (valor, texto)
    SECURITY_QUESTIONS = [
        (1, '¿Cuál es el nombre de tu primera mascota?'),
        (2, '¿En qué ciudad naciste?'),
        (3, '¿Cuál es el nombre de tu madre?'),
        (4, '¿Cuál fue tu primer colegio?'),
        (5, '¿Cuál es tu comida favorita?'),
        (6, '¿Cómo se llama tu mejor amigo de la infancia?'),
        (7, '¿Cuál es tu película favorita?'),
        (8, '¿Qué deporte practicabas de niño?'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Campo de pregunta (usa choices para el select)
    security_question = models.IntegerField(
        choices=SECURITY_QUESTIONS,
        verbose_name="Pregunta de seguridad",
    )
    
    # Respuesta (se almacena hasheada)
    security_answer = models.CharField(
        max_length=128,  # Tamaño para hash SHA256
        verbose_name="Respuesta de seguridad",
    )

    def __str__(self):
        return f"Perfil de {self.user.username}"

    def set_security_answer(self, raw_answer):
        """Hashea la respuesta antes de guardarla."""
        self.security_answer = make_password(raw_answer.lower().strip())

    def check_security_answer(self, raw_answer):
        """Verifica si la respuesta coincide."""
        return check_password(raw_answer.lower().strip(), self.security_answer)