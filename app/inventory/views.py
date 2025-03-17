from django.shortcuts import render
from django.http.response import JsonResponse, HttpResponse
from .models import Asset
from django.http import HttpResponseRedirect
from .forms import AssetCreate
from django.urls import reverse
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.db import IntegrityError
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
            try:
                prefix = asset_create_form.cleaned_data['prefix']
                state_asset = asset_create_form.cleaned_data['state_asset']
                full_st = f"{prefix}{state_asset}"
                state_asset = full_st

                assets = Asset(
                    model=asset_create_form.cleaned_data['model'],
                    serial_number=asset_create_form.cleaned_data['serial_number'],
                    state_asset=full_st,
                    status=asset_create_form.cleaned_data['status'],
                    observation=asset_create_form.cleaned_data['observation'],
                    fk_category=asset_create_form.cleaned_data['fk_category'],
                    fk_brand=asset_create_form.cleaned_data['fk_brand'],
                )
                assets.save()
                messages.success(request, 'El activo se ha guardado correctamente.')
                return HttpResponseRedirect(reverse('home:inventory'))
            
            except IntegrityError as e:
                # Captura el error de integridad (por ejemplo, serial_number duplicado)
                if 'serial_number' in str(e):
                    messages.error(request, 'Error: El número de serie ya existe. Por favor, ingrese un número de serie único.')
                    return HttpResponseRedirect(reverse('home:inventory'))
                else:
                    messages.error(request, 'Error: Ocurrió un problema al guardar el activo. Por favor, inténtelo de nuevo.')
                    return HttpResponseRedirect(reverse('home:inventory'))
            
            except Exception as e:
                # Captura cualquier otro error inesperado
                messages.error(request, f'Error inesperado: {str(e)}')
                return HttpResponseRedirect(reverse('home:inventory'))
        
        else:
            # Si el formulario no es válido, muestra errores de validación
            for field, errors in asset_create_form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
                    return HttpResponseRedirect(reverse('home:inventory'))
    
    else:
        asset_create_form = AssetCreate()
    
    return render(request, 'index.html', {'form': asset_create_form})

def delete_asset(request, asset_id):
    print(f"Received request method: {request.method}")  # Para depuración
    if request.method == "DELETE":
        try:
            asset = Asset.objects.get(pk=asset_id)
            asset.delete()
            return JsonResponse({"message": "Categoría eliminada correctamente."})
        except Asset.DoesNotExist:
            return JsonResponse({"error": "Categoría no encontrada."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return HttpResponse(status=405)  # Método no permitido