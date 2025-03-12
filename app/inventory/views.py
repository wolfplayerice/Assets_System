from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from .models import Asset,Category, Brand
# Create your views here.


def listAssets(request):
    assets = Asset.objects.all().select_related('fk_category', 'fk_brand')
    data = {
        'assets': [asset.to_dict() for asset in assets]
    }
    return JsonResponse(data)

def index(request):
    return render(request, 'index.html')

