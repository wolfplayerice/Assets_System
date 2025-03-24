from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .forms import VerifyUser

@login_required
def user_info(request):
    return render(request, 'user_info.html',{
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'VerifyUser': VerifyUser
        })