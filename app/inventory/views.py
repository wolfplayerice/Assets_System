from django.shortcuts import render
from django.http.response import JsonResponse
from .models import Asset
from django.http import HttpResponseRedirect
from .forms import AssetCreate
from django.urls import reverse
from django.contrib import messages
# Create your views here.


def inventory(request):
    asset_create_form = AssetCreate()
    return render(request, 'index.html', { 'form': asset_create_form})

def list_assets(request):
    assets = Asset.objects.all()
    data = {'Asset': [asset.to_dict() for asset in assets]}
    return JsonResponse(data)

def asset_create(request):
    if request.method == "POST":
        asset_create_form = AssetCreate(request.POST)
        if asset_create_form.is_valid():
            prefix = asset_create_form.cleaned_data['prefix']
            state_asset = asset_create_form.cleaned_data['state_asset']
            full_st = f"{prefix}{state_asset}"
            state_asset=full_st

            assets = Asset( 
            model=asset_create_form.cleaned_data['model'],
            serial_number=asset_create_form.cleaned_data['serial_number'],
            state_asset = full_st,
            status = asset_create_form.cleaned_data['status'],
            observation=asset_create_form.cleaned_data['observation'],
            fk_category=asset_create_form.cleaned_data['fk_category'],
            fk_brand=asset_create_form.cleaned_data['fk_brand'],
            )
            assets.save()
            messages.success(request, 'El activo se ha guardado correctamente.')
            return HttpResponseRedirect(reverse('inventory:inventory')) 
    else:
        asset_create_form = AssetCreate()
    
    return render(request, 'index.html', {'form': asset_create_form})

