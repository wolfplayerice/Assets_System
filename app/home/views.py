from django.shortcuts import render
from inventory.models import Asset
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from brand.models import Brand
from category.models import Category

@login_required
def home(request):

    return render(request, 'home.html', {
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

@login_required
def dashboard(request):
    # Conteo de Dispositivos operativos y no operativos, bienes y usuarios
    categories = Category.objects.all()
    brands = Brand.objects.all()
    total_assets = Asset.objects.count()
    total_user = User.objects.count()
    operational_assets = Asset.objects.filter(status=1).count()
    inoperational_assets = Asset.objects.filter(status=0).count()
    success_message = request.session.pop('success', None)
    return render(request, 'dashboard.html', {
        'total_assets': total_assets,
        'total_user': total_user,
        'operational_assets': operational_assets,
        'inoperational_assets': inoperational_assets,
            # Conteo de Dispositivos operativos y no operativos, bienes y usuarios V.P
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'success': success_message,
        'categories': categories,
        'brands': brands,
    })