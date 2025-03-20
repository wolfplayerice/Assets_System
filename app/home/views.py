from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def home(request):
    return render(request, 'home.html',{
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

@login_required
def dashboard(request):
    success_message = request.session.pop('success', None)
    return render(request, 'dashboard.html', {
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'success': success_message
    })