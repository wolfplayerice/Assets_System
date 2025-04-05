from django.core.cache import cache
from django.contrib.auth import logout
from django.contrib import messages
from django.urls import reverse
from django.shortcuts import redirect
from django.http import JsonResponse
from django.contrib.sessions.models import Session

class UserRestrictMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Excluir el admin de esta verificación
        if request.path.startswith('/admin/'):
            return self.get_response(request)

    def __call__(self, request):
        # Procesar la respuesta primero para asegurar que la sesión esté guardada
        response = self.get_response(request)
        
        if request.user.is_authenticated:
            current_session_key = request.session.session_key
            user_sessions = Session.objects.filter(
                session_data__contains=f'"_auth_user_id":{request.user.pk}'
            ).exclude(session_key=current_session_key)
            
            if user_sessions.exists():
                # Cerrar otras sesiones
                for session in user_sessions:
                    session.delete()
                
                # Si hay sesiones previas, cerrar la actual también
                logout(request)
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({
                        'force_reload': True,
                        'login_url': reverse('login') + '?session_terminated=1'
                    }, status=403)
                return redirect(reverse('login') + '?session_terminated=1')

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