from django.shortcuts import render
from django.http.response import JsonResponse
from .models import Asset
# Create your views here.


def index(request):
    return render(request, 'index.html')

def list_assets(request):
    assets = Asset.objects.all()
    data = {'Asset': [asset.to_dict() for asset in assets]}
    return JsonResponse(data)
