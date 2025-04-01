from django.core.cache import cache
from django.contrib.auth import logout
from django.contrib import messages
from django.urls import reverse
from django.shortcuts import redirect

class UserRestrictMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Primero dejamos que Django procese la solicitud
        response = self.get_response(request)
        
        if request.user.is_authenticated:
            cache_key = f"user_{request.user.pk}_active_session"
            current_session = request.session.session_key
            
            # Verificar si hay una sesión más reciente
            stored_session = cache.get(cache_key)
            
            if stored_session and stored_session != current_session:
                # Hay una sesión más nueva activa
                logout(request)
                request.session.flush()  # Limpia toda la sesión
                messages.error(request, 'Sesión cerrada: Se detectó un nuevo acceso desde otro dispositivo')
                return redirect(reverse('login') + '?session_terminated=1')
            
            # Actualizar/establecer la sesión activa
            cache.set(cache_key, current_session, 900)  # 15 minutos
        
        return response