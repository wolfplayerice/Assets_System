from django.core.cache import cache
from django.contrib.auth import logout
from django.contrib import messages
from django.urls import reverse
from django.shortcuts import redirect
from django.http import JsonResponse

class UserRestrictMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if request.user.is_authenticated:
            cache_key = f"user_{request.user.pk}_active_session"
            current_session = request.session.session_key
            stored_session = cache.get(cache_key)
            
            if stored_session and stored_session != current_session:
                # Preparamos la respuesta para forzar recarga
                logout(request)
                messages.error(request, 'Sesión cerrada: Se detectó un nuevo acceso desde otro dispositivo')
                
                # Respuesta especial para recargar
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    # Si es AJAX, devolvemos JSON
                    return JsonResponse({
                        'force_reload': True,
                        'login_url': reverse('login') + '?session_terminated=1'
                    }, status=403)
                else:
                    # Si es petición normal, redirigimos directamente
                    return redirect(reverse('login') + '?session_terminated=1')
            
            # Actualizar siempre con la sesión actual
            cache.set(cache_key, current_session, 900)

        return response
    
class NoCacheMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated:
            response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
        return response