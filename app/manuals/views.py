from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def manuals(request):
    return render(request, 'manuals/manuals.html', {
        'message': 'Hola'
    })